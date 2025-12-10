export type Priority = 'low' | 'normal' | 'high';

export interface DownloadOptions {
    priority?: Priority;
    headers?: Record<string, string>;
    cacheable?: boolean;
}

export interface CacheEntry {
    key: string;
    path: string;
    timestamp: number;
    size: number;
}

export type SmartImageSource = {
    uri: string;
    width?: number; // Desired width (for cache key or selection)
    height?: number; // Desired height
    headers?: Record<string, string>;
    priority?: Priority;
};

export interface SmartImageProps {
    source: SmartImageSource | number; // number for local require('./image.png')
    placeholder?: SmartImageSource | number | string; // string for color
    style?: any;
    imageStyle?: any;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'center' | 'repeat';
    priority?: Priority;
    useCache?: boolean;
    preview?: boolean; // Enable fullscreen preview
    zoomable?: boolean; // Enable zoom in preview (default: true if preview is enabled)
    onLoadStart?: () => void;
    onProgress?: (loaded: number, total: number) => void;
    onLoad?: (event: any) => void;
    onError?: (error: any) => void;
}
