import { Injectable } from '@angular/core';
import { WifiPlugin } from '@capacitor-community/wifi';
import { Plugins } from '@capacitor/core';
import { GoProBluetoothService } from './go-pro-bluetooth.service';
const Wifi: WifiPlugin = Plugins.Wifi as WifiPlugin;
@Injectable({
  providedIn: 'root',
})
export class GoProWifiService {
  constructor(private goProBluetoothService: GoProBluetoothService) {}

  async connectToGoProWiFi(): Promise<string> {
    const creds = await this.goProBluetoothService.getGoProWiFiCreds();
    const result = await Wifi.connect({
      ssid: creds.wifiSSID,
      password: creds.wifiPASS,
    });

    return result.ssid!;
  }

  async isConnectedToGoProWifi() {
    const result = await Wifi.getSSID();
    return result.ssid?.startsWith('GP') || false;
  }

  async getConnectedWifiSSID() {
    const result = await Wifi.getSSID();
    return result.ssid;
  }
}
