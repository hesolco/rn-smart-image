export const Helpers = {
    /**
     * Generates a unique cache key based on the image URI and its dimensions.
     * If width/height are provided, they are part of the key to support resizing contexts.
     */
    generateKey: (uri: string, width?: number, height?: number): string => {
        const raw = `${uri}${width ? `-${width}` : ''}${height ? `-${height}` : ''}`;
        // Simple, deterministic hash for cache keys (not cryptographic).
        // Uses FNV-1a 32-bit and returns hex.
        let hash = 0x811c9dc5;
        for (let i = 0; i < raw.length; i++) {
            hash ^= raw.charCodeAt(i);
            hash = Math.imul(hash, 0x01000193);
        }
        // Convert to unsigned 32-bit hex
        return (hash >>> 0).toString(16).padStart(8, '0');
    },

    /**
     * Safe file path handling
     */
    getFileName: (key: string, extension: string = 'jpg'): string => {
        return `${key}.${extension}`;
    },
};
