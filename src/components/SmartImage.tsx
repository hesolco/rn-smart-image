import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Image,
    Animated,
    StyleSheet,
    Modal,
    Pressable,
    Text,
    Dimensions,
    PanResponder,
    Platform
} from 'react-native';
import { SmartImageProps, SmartImageSource } from '../types';
import { CacheManager } from '../core/CacheManager';
import { DownloadManager } from '../core/DownloadManager';
import { Helpers } from '../utils/Helpers';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ZoomableImage = ({ source, zoomable }: { source: any, zoomable: boolean }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
    
    const initialDistance = useRef<number | null>(null);
    const initialScale = useRef<number>(1);
    const currentScale = useRef<number>(1);

    const panResponder = useRef(
        PanResponder.create({
            // Allow children views to receive touches
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderTerminationRequest: () => false, // Important for Android

            onPanResponderGrant: () => {
                pan.extractOffset();
            },
            onPanResponderMove: (evt, gestureState) => {
                const touches = evt.nativeEvent.touches;
                
                // Case 1: Pinch to Zoom (2 fingers)
                if (touches.length === 2 && zoomable) {
                    const touch1 = touches[0];
                    const touch2 = touches[1];
                    const distance = Math.sqrt(
                        Math.pow(touch1.pageX - touch2.pageX, 2) + 
                        Math.pow(touch1.pageY - touch2.pageY, 2)
                    );

                    if (!initialDistance.current) {
                        initialDistance.current = distance;
                        initialScale.current = currentScale.current;
                    } else {
                        const scaleFactor = distance / initialDistance.current;
                        // Limit zoom from 1x to 2x
                        const newScale = Math.min(Math.max(1, initialScale.current * scaleFactor), 2);
                        
                        scale.setValue(newScale);
                        currentScale.current = newScale;
                    }
                } 
                // Case 2: Pan (Move when zoomed)
                else if (touches.length === 1 && currentScale.current > 1) {
                    Animated.event(
                        [null, { dx: pan.x, dy: pan.y }],
                        { useNativeDriver: false }
                    )(evt, gestureState);
                }
            },
            onPanResponderRelease: () => {
                pan.flattenOffset();
                initialDistance.current = null;
                
                // If scale < 1 (too small) -> Reset to 1
                if (currentScale.current < 1) {
                    Animated.parallel([
                        Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
                        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true })
                    ]).start();
                    currentScale.current = 1;
                }
                // If scale = 1 -> Reset position to center
                else if (currentScale.current === 1) {
                     Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
                }
            }
        })
    ).current;

    return (
        <View style={styles.modalContent} {...panResponder.panHandlers}>
            <Animated.Image
                source={source}
                resizeMode="contain"
                style={{
                    width: '100%',
                    height: '100%',
                    transform: [
                        { scale: scale },
                        { translateX: pan.x },
                        { translateY: pan.y }
                    ]
                }}
            />
        </View>
    );
};


export const SmartImage: React.FC<SmartImageProps> = ({
    source,
    placeholder,
    style,
    imageStyle,
    resizeMode = 'cover',
    priority = 'normal',
    useCache = true,
    preview = false,
    zoomable = true,
    onLoadStart,
    onLoad,
    onError,
}) => {
    const [imageSource, setImageSource] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    
    const opacity = useRef(new Animated.Value(0)).current;
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        if (typeof source === 'number') {
            setImageSource(source);
            setLoading(false);
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
            return;
        }

        const { uri, width, height } = source as SmartImageSource;

        if (!uri) return;

        loadRemoteImage(uri, width, height);
    }, [source]);

    const loadRemoteImage = async (uri: string, width?: number, height?: number) => {
        if (onLoadStart) onLoadStart();

        const key = Helpers.generateKey(uri, width, height);
        const cacheManager = CacheManager.getInstance();

        if (useCache) {
            const cachedPath = await cacheManager.get(key);
            if (cachedPath) {
                if (isMounted.current) {
                    setImageSource({ uri: cachedPath });
                    startTransition();
                }
                return;
            }
        }

        const downloadManager = DownloadManager.getInstance();
        const destination = cacheManager.getPath(key);

        try {
            const downloadedPath = await downloadManager.download(
                uri,
                destination,
                priority
            );
            if (isMounted.current) {
                setImageSource({ uri: downloadedPath });
                startTransition();
            }
        } catch (e) {
            console.error('SmartImage download error:', e);
            if (onError) onError(e);
            setLoading(false);
        }
    };

    const startTransition = () => {
        setLoading(false);
        Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            if (onLoad) onLoad(null);
        });
    };

    const renderPlaceholder = () => {
        if (!loading || !placeholder) return null;

        if (typeof placeholder === 'string') {
            return <View style={[StyleSheet.absoluteFill, { backgroundColor: placeholder }]} />;
        }

        return (
            <Image
                source={typeof placeholder === 'number' ? placeholder : { uri: (placeholder as SmartImageSource).uri }}
                style={[styles.fullSize, { resizeMode }, imageStyle]}
            />
        );
    };

    const renderImage = () => (
        <View style={[styles.container, style]}>
            {renderPlaceholder()}
            {imageSource && (
                <Animated.Image
                    source={imageSource}
                    style={[
                        styles.fullSize,
                        { resizeMode, opacity },
                        imageStyle
                    ]}
                    onLoadEnd={() => {}}
                />
            )}
        </View>
    );

    if (preview) {
        return (
            <>
                <Pressable onPress={() => setModalVisible(true)}>
                    {renderImage()}
                </Pressable>

                <Modal 
                    visible={modalVisible} 
                    transparent={true} 
                    animationType="fade"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <Pressable 
                            style={styles.closeButton} 
                            onPress={() => setModalVisible(false)}
                            hitSlop={{top: 20, bottom: 20, left: 20, right: 20}} // Increase touch area
                        >
                            <Text style={styles.closeText}>✕</Text>
                        </Pressable>

                        {imageSource && (
                            <ZoomableImage 
                                source={imageSource} 
                                zoomable={zoomable} 
                            />
                        )}
                    </View>
                </Modal>
            </>
        );
    }

    return renderImage();
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        backgroundColor: '#E1E1E1',
    },
    fullSize: {
        ...StyleSheet.absoluteFillObject,
        width: undefined,
        height: undefined,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 30,
        right: 20,
        zIndex: 999,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
    },
    closeText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    }
});
