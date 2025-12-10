import RNFS from 'react-native-fs';

type Priority = 'low' | 'normal' | 'high';

interface DownloadRequest {
    id: string;
    uri: string;
    destination: string;
    priority: Priority;
    resolve: (path: string) => void;
    reject: (error: any) => void;
    attempts: number;
}

const MAX_CONCURRENCY = 4;
const MAX_RETRIES = 3;

export class DownloadManager {
    private static instance: DownloadManager;
    private queue: DownloadRequest[] = [];
    private activeDownloads: number = 0;

    private constructor() { }

    static getInstance(): DownloadManager {
        if (!DownloadManager.instance) {
            DownloadManager.instance = new DownloadManager();
        }
        return DownloadManager.instance;
    }

    /**
     * Adds a download task to the queue.
     */
    download(uri: string, destination: string, priority: Priority = 'normal'): Promise<string> {
        return new Promise((resolve, reject) => {
            const request: DownloadRequest = {
                id: `${uri}-${Date.now()}`,
                uri,
                destination,
                priority,
                resolve,
                reject,
                attempts: 0,
            };

            this.addToQueue(request);
            this.processQueue();
        });
    }

    private addToQueue(request: DownloadRequest) {
        this.queue.push(request);
        // Sort by priority: HIGH > NORMAL > LOW
        this.queue.sort((a, b) => {
            const priorityWeight = { high: 3, normal: 2, low: 1 };
            return priorityWeight[b.priority] - priorityWeight[a.priority];
        });
    }

    private async processQueue() {
        if (this.activeDownloads >= MAX_CONCURRENCY || this.queue.length === 0) {
            return;
        }

        const request = this.queue.shift();
        if (!request) return;

        this.activeDownloads++;

        try {
            request.attempts++;
            // Temporary download path
            const tempPath = `${request.destination}.tmp`;

            const ret = RNFS.downloadFile({
                fromUrl: request.uri,
                toFile: tempPath,
            });

            const result = await ret.promise;

            if (result.statusCode === 200) {
                // Move temp file to actual destination
                await RNFS.moveFile(tempPath, request.destination);
                request.resolve(`file://${request.destination}`);
            } else {
                throw new Error(`Download failed with status ${result.statusCode}`);
            }
        } catch (error) {
            if (request.attempts < MAX_RETRIES) {
                // Re-queue the request if retry attempts remain
                console.warn(`Retry ${request.attempts} for ${request.uri}`);
                this.addToQueue(request);
            } else {
                request.reject(error);
            }
        } finally {
            this.activeDownloads--;
            this.processQueue();
        }
    }
}
