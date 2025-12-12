import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {CacheManager, DownloadManager, SmartImage} from 'rn-smart-image';

const formatBytes = (bytes: number) => {
  if (!bytes || bytes <= 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
};

const generateKey = (raw: string) => {
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash * 31 + raw.charCodeAt(i)) % 4294967296;
  }
  return hash.toString(16).padStart(8, '0');
};

const Section = ({
  title,
  description,
  right,
  children,
}: {
  title: string;
  description?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderLeft}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {!!description && (
            <Text style={styles.sectionDescription}>{description}</Text>
          )}
        </View>
        {!!right && <View style={styles.sectionHeaderRight}>{right}</View>}
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
};

const App = () => {
  const cacheManager = useMemo(() => CacheManager.getInstance(), []);
  const downloadManager = useMemo(() => DownloadManager.getInstance(), []);

  const links = useMemo(
    () => ({
      npm: 'https://www.npmjs.com/package/rn-smart-image',
      githubRepo: 'https://github.com/hesolco/rn-smart-image',
      githubAuthor: 'https://github.com/hesolco',
    }),
    [],
  );

  const [cacheSize, setCacheSize] = useState<number>(0);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>('Ready');

  const refreshCacheSize = useCallback(async () => {
    try {
      const size = await cacheManager.getCacheSize();
      setCacheSize(size);
    } catch {
      setCacheSize(0);
    }
  }, [cacheManager]);

  useEffect(() => {
    refreshCacheSize();
  }, [refreshCacheSize]);

  const onClearCache = useCallback(() => {
    Alert.alert('Clear cache', 'Remove all cached files?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          setStatus('Clearing cache...');
          try {
            await cacheManager.clearCache();
            await refreshCacheSize();
            setStatus('Cache cleared');
          } catch (e: any) {
            setStatus(`Clear failed: ${String(e?.message ?? e)}`);
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  }, [cacheManager, refreshCacheSize]);

  const onPreload = useCallback(async () => {
    const uri = 'https://picsum.photos/1200/800';
    const key = generateKey(uri);
    const destination = cacheManager.getPath(key);

    setBusy(true);
    setStatus('Preloading a high-priority image...');
    try {
      await downloadManager.download(uri, destination, 'high');
      await refreshCacheSize();
      setStatus('Preload completed');
    } catch (e: any) {
      setStatus(`Preload failed: ${String(e?.message ?? e)}`);
    } finally {
      setBusy(false);
    }
  }, [cacheManager, downloadManager, refreshCacheSize]);

  const openLink = useCallback(async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert('Cannot open link', url);
        return;
      }
      await Linking.openURL(url);
    } catch (e: any) {
      Alert.alert('Open link failed', String(e?.message ?? e));
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>rn-smart-image</Text>
            <Text style={styles.headerSubtitle}>Example showcase</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.statusRow}>
              {busy && <ActivityIndicator size="small" />}
              <Text numberOfLines={1} style={styles.statusText}>
                {status}
              </Text>
            </View>
            <Text style={styles.cacheText}>
              Cache: {formatBytes(cacheSize)}
            </Text>
          </View>
        </View>

        <Section
          title="1) Basic loading"
          description="Load a remote image with default behavior (cache enabled).">
          <SmartImage
            source={{uri: 'https://picsum.photos/600/360'}}
            style={styles.heroImage}
          />
        </Section>

        <Section
          title="2) Placeholder & fade-in"
          description="Show a placeholder color while downloading.">
          <SmartImage
            source={{uri: 'https://picsum.photos/700/420?random=1'}}
            style={styles.heroImage}
            placeholder="#E6E8EB"
          />
        </Section>

        <Section
          title="3) Full-screen preview & pinch-to-zoom"
          description="Tap image to preview. Pinch to zoom inside the modal.">
          <SmartImage
            source={{uri: 'https://picsum.photos/800/500?random=2'}}
            style={styles.heroImage}
            placeholder="#111827"
            preview={true}
            zoomable={true}
          />
          <Text style={styles.hintText}>
            Tip: tap the image to open preview
          </Text>
        </Section>

        <Section
          title="4) Priority queue"
          description="Download priority helps important images load first.">
          <View style={styles.row2}>
            <View style={styles.col}>
              <Text style={styles.badgeLow}>LOW</Text>
              <SmartImage
                source={{uri: 'https://picsum.photos/400/400?random=3'}}
                style={styles.squareImage}
                placeholder="#F3F4F6"
                priority="low"
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.badgeHigh}>HIGH</Text>
              <SmartImage
                source={{uri: 'https://picsum.photos/401/401?random=4'}}
                style={styles.squareImage}
                placeholder="#F3F4F6"
                priority="high"
              />
            </View>
          </View>
        </Section>

        <Section
          title="5) Grid list"
          description="Typical feed/grid usage with repeated SmartImage instances.">
          <View style={styles.grid}>
            {Array.from({length: 8}).map((_, idx) => {
              const i = idx + 1;
              return (
                <SmartImage
                  key={i}
                  source={{
                    uri: `https://picsum.photos/220/220?random=${i + 10}`,
                  }}
                  style={styles.gridImage}
                  placeholder="#E5E7EB"
                  preview={true}
                />
              );
            })}
          </View>
        </Section>

        <Section
          title="6) Cache tools"
          description="Inspect and manage filesystem cache."
          right={
            <View style={styles.actionsRow}>
              <Pressable
                style={[styles.button, styles.buttonSecondary]}
                onPress={refreshCacheSize}>
                <Text style={styles.buttonTextSecondary}>Refresh</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.buttonDanger]}
                onPress={onClearCache}>
                <Text style={styles.buttonTextDanger}>Clear</Text>
              </Pressable>
            </View>
          }>
          <View style={styles.kvRow}>
            <Text style={styles.kvKey}>Current cache size</Text>
            <Text style={styles.kvValue}>{formatBytes(cacheSize)}</Text>
          </View>
          <View style={styles.kvRow}>
            <Text style={styles.kvKey}>Cache location</Text>
            <Text style={styles.kvValue}>
              RNFS.CachesDirectoryPath/smart-image
            </Text>
          </View>
        </Section>

        <Section
          title="7) Preload (DownloadManager)"
          description="Queue a download ahead of time (HIGH priority)."
          right={
            <Pressable
              style={[styles.button, styles.buttonPrimary]}
              disabled={busy}
              onPress={onPreload}>
              <Text style={styles.buttonTextPrimary}>
                {busy ? 'Working...' : 'Preload'}
              </Text>
            </Pressable>
          }>
          <Text style={styles.hintText}>
            This will download an image to cache so it loads instantly next
            time.
          </Text>
          <SmartImage
            source={{uri: 'https://picsum.photos/1200/800'}}
            style={styles.heroImage}
            placeholder="#E5E7EB"
            priority="high"
          />
        </Section>

        <Section
          title="8) About & Links"
          description="Download links and author information.">
          <Pressable style={styles.linkRow} onPress={() => openLink(links.npm)}>
            <Text style={styles.linkLabel}>NPM</Text>
            <Text style={styles.linkValue} numberOfLines={1}>
              {links.npm}
            </Text>
          </Pressable>
          <Pressable
            style={styles.linkRow}
            onPress={() => openLink(links.githubRepo)}>
            <Text style={styles.linkLabel}>GitHub Repo</Text>
            <Text style={styles.linkValue} numberOfLines={1}>
              {links.githubRepo}
            </Text>
          </Pressable>
          <Pressable
            style={styles.linkRow}
            onPress={() => openLink(links.githubAuthor)}>
            <Text style={styles.linkLabel}>Author</Text>
            <Text style={styles.linkValue} numberOfLines={1}>
              {links.githubAuthor}
            </Text>
          </Pressable>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0B1220'},
  scrollContent: {padding: 16, paddingBottom: 32},

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  headerLeft: {flex: 1},
  headerRight: {alignItems: 'flex-end', maxWidth: 220},
  headerTitle: {color: '#FFFFFF', fontSize: 22, fontWeight: '800'},
  headerSubtitle: {color: '#9CA3AF', marginTop: 2},
  statusRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  statusText: {color: '#E5E7EB', fontSize: 12},
  cacheText: {color: '#9CA3AF', marginTop: 6, fontSize: 12},

  section: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1F2937',
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  sectionHeaderLeft: {flex: 1},
  sectionHeaderRight: {alignItems: 'flex-end'},
  sectionTitle: {color: '#FFFFFF', fontSize: 16, fontWeight: '700'},
  sectionDescription: {
    color: '#9CA3AF',
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16,
  },
  sectionBody: {gap: 10},

  heroImage: {width: '100%', height: 210, borderRadius: 12},
  hintText: {color: '#9CA3AF', fontSize: 12},

  row2: {flexDirection: 'row', gap: 10},
  col: {flex: 1, gap: 8},
  squareImage: {width: '100%', aspectRatio: 1, borderRadius: 12},
  badgeLow: {
    alignSelf: 'flex-start',
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
  },
  badgeHigh: {
    alignSelf: 'flex-start',
    color: '#FCA5A5',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
  },

  grid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  gridImage: {width: '48%', aspectRatio: 1, borderRadius: 12},

  actionsRow: {flexDirection: 'row', gap: 8},
  button: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  buttonPrimary: {backgroundColor: '#2563EB', borderColor: '#1D4ED8'},
  buttonSecondary: {backgroundColor: 'transparent', borderColor: '#374151'},
  buttonDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: '#7F1D1D',
  },
  buttonTextPrimary: {color: '#FFFFFF', fontWeight: '700', fontSize: 13},
  buttonTextSecondary: {color: '#E5E7EB', fontWeight: '700', fontSize: 13},
  buttonTextDanger: {color: '#FCA5A5', fontWeight: '800', fontSize: 13},

  kvRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 6,
  },
  kvKey: {color: '#9CA3AF', fontSize: 12},
  kvValue: {color: '#E5E7EB', fontSize: 12, fontWeight: '600'},

  linkRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  linkLabel: {color: '#9CA3AF', fontSize: 12},
  linkValue: {color: '#93C5FD', fontSize: 12, fontWeight: '700', marginTop: 4},
});

export default App;
