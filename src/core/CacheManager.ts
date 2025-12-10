import RNFS from 'react-native-fs';

const CACHE_FOLDER = `${RNFS.CachesDirectoryPath}/smart-image`;

export class CacheManager {
    private static instance: CacheManager;

    private constructor() {
        this.init();
    }

    static getInstance(): CacheManager {
        if (!CacheManager.instance) {
            CacheManager.instance = new CacheManager();
        }
        return CacheManager.instance;
    }

    private async init() {
        try {
            const exists = await RNFS.exists(CACHE_FOLDER);
            if (!exists) {
                await RNFS.mkdir(CACHE_FOLDER);
            }
        } catch (e) {
            console.error('Failed to initialize cache directory', e);
        }
    }

    /**
     * Checks if a file exists in the cache.
     * key is generated from uri + options
     */
    async get(key: string): Promise<string | null> {
        const path = `${CACHE_FOLDER}/${key}`;
        try {
            const exists = await RNFS.exists(path);
            if (exists) {
                return `file://${path}`;
            }
        } catch (e) {
            console.error('Cache get error', e);
        }
        return null;
    }

    /**
     * Returns the local path where the file SHOULD be saved.
     */
    getPath(key: string): string {
        return `${CACHE_FOLDER}/${key}`;
    }

    /**
     * Clears the entire cache folder.
     */
    async clearCache(): Promise<void> {
        try {
            await RNFS.unlink(CACHE_FOLDER);
            await RNFS.mkdir(CACHE_FOLDER);
        } catch (e) {
            console.error('Failed to clear cache', e);
        }
    }

    /**
     * Gets cache size in bytes.
     */
    async getCacheSize(): Promise<number> {
        try {
            const result = await RNFS.readDir(CACHE_FOLDER);
            return result.reduce((acc, item) => acc + item.size, 0);
        } catch (e) {
            return 0;
        }
    }
}
