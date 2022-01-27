import { Injectable } from '@angular/core';
import { WifiPlugin } from '@capacitor-community/wifi';
import { Plugins } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { GoProBluetoothService } from './go-pro-bluetooth.service';
const Wifi: WifiPlugin = Plugins.Wifi as WifiPlugin;

const { Storage } = Plugins;

@Injectable({
  providedIn: 'root',
})
export class GoProWifiService {
  private readonly GO_PRO_TUTORIAL_MOBILE_DATA_ONLY_APPS_STORAGE_KEY =
    'GO_PRO_TUTORIAL_MOBILE_DATA_ONLY_APPS_STORAGE_KEY';

  constructor(
    private readonly goProBluetoothService: GoProBluetoothService,
    public platform: Platform
  ) {}

  static async isConnectedToGoProWifi() {
    const result = await Wifi.getSSID();
    return result.ssid?.startsWith('GP') ?? false;
  }

  static async getConnectedWifiSSID() {
    const result = await Wifi.getSSID();
    return result.ssid;
  }

  async connectToGoProWiFi(): Promise<string> {
    await this.goProBluetoothService.enableGoProWifi();
    const creds = await this.goProBluetoothService.getGoProWiFiCreds();
    const result = await Wifi.connect({
      ssid: creds.wifiSSID,
      password: creds.wifiPASS,
    });

    return result.ssid!;
  }

  async showTutorialForMobileDataOnlyApps() {
    if (this.platform.is('android') === false) return false;

    const result = await Storage.get({
      key: this.GO_PRO_TUTORIAL_MOBILE_DATA_ONLY_APPS_STORAGE_KEY,
    });

    if (result.value) {
      return JSON.parse(result.value) as boolean;
    }

    return false;
  }

  async dontShowAgainTutorialForMobileDataOnlyApps() {
    await Storage.set({
      key: this.GO_PRO_TUTORIAL_MOBILE_DATA_ONLY_APPS_STORAGE_KEY,
      value: JSON.stringify(true),
    });
  }
}
