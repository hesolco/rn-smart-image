import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export class NetworkManager {
    private static instance: NetworkManager;
    private isConnected: boolean = true;
    private connectionType: string = 'unknown';

    private constructor() {
        NetInfo.addEventListener(this.handleConnectivityChange);
    }

    static getInstance(): NetworkManager {
        if (!NetworkManager.instance) {
            NetworkManager.instance = new NetworkManager();
        }
        return NetworkManager.instance;
    }

    private handleConnectivityChange = (state: NetInfoState) => {
        this.isConnected = state.isConnected ?? true;
        this.connectionType = state.type;
    };

    isOnline(): boolean {
        return this.isConnected;
    }

    shouldLoadHighQuality(): boolean {
        // Example logic: Wifi/Ethernet = High, Cellular 4g/LTE = Normal/High, Others = Low
        // For V1, simple check: is it wifi?
        return this.connectionType === 'wifi' || this.connectionType === 'ethernet';
    }
}
