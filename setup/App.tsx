import React from 'react';
import { SafeAreaView, ScrollView, Text, View, StyleSheet } from 'react-native';
import { SmartImage } from 'rn-smart-image';

const App = () => {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.header}>rn-smart-image Demo</Text>

                <View style={styles.section}>
                    <Text style={styles.label}>Basic Image</Text>
                    <SmartImage
                        source={{ uri: 'https://picsum.photos/400/300' }}
                        style={styles.image}
                        placeholder="#cccccc"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>High Priority</Text>
                    <SmartImage
                        source={{ uri: 'https://picsum.photos/800/600' }}
                        style={styles.image}
                        placeholder="#ffdddd"
                        priority="high"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Grid List</Text>
                    <View style={styles.grid}>
                        {[1, 2, 3, 4].map(i => (
                            <SmartImage
                                key={i}
                                source={{ uri: `https://picsum.photos/200/200?random=${i}` }}
                                style={styles.gridImage}
                                placeholder="gray"
                            />
                        ))}
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scrollContent: { padding: 20 },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    section: { marginBottom: 30 },
    label: { fontSize: 16, marginBottom: 10, fontWeight: '600' },
    image: { width: '100%', height: 200, borderRadius: 8 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    gridImage: { width: 100, height: 100, borderRadius: 8 }
});

export default App;
