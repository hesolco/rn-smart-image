import CryptoJS from 'crypto-js';

export const Helpers = {
    /**
     * Generates a unique cache key based on the image URI and its dimensions.
     * If width/height are provided, they are part of the key to support resizing contexts.
     */
    generateKey: (uri: string, width?: number, height?: number): string => {
        const raw = `${uri}${width ? `-${width}` : ''}${height ? `-${height}` : ''}`;
        return CryptoJS.SHA256(raw).toString(CryptoJS.enc.Hex);
    },

    /**
     * Safe file path handling
     */
    getFileName: (key: string, extension: string = 'jpg'): string => {
        return `${key}.${extension}`;
    },
};
