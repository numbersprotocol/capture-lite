import { Injectable } from '@angular/core';
import { Wifi } from '@capacitor-community/wifi';
import { Platform } from '@ionic/angular';
import { PreferenceManager } from '../../../../shared/preference-manager/preference-manager.service';
import { GoProBluetoothService } from './go-pro-bluetooth.service';

@Injectable({
  providedIn: 'root',
})
export class GoProWifiService {
  readonly id = 'GoProWifiService';

  private readonly preferences = this.preferenceManager.getPreferences(this.id);

  constructor(
    private readonly preferenceManager: PreferenceManager,
    private readonly goProBluetoothService: GoProBluetoothService,
    public platform: Platform
  ) {}

  // eslint-disable-next-line class-methods-use-this
  async isConnectedToGoProWifi(): Promise<boolean> {
    const result = await Wifi.getSSID();
    return result.ssid?.startsWith('GP') ?? false;
  }

  // eslint-disable-next-line class-methods-use-this
  async getConnectedWifiSSID() {
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

    return result.ssid ?? '';
  }

  async showTutorialForMobileDataOnlyApps() {
    if (this.platform.is('android') === false) return false;

    const result = await this.preferences.getBoolean(
      PrefKeys.SHOW_MOBILE_DATA_TUTORIAL_ON_IOS,
      true
    );

    return result;
  }

  async dontShowAgainTutorialForMobileDataOnlyApps() {
    await this.preferences.setBoolean(
      PrefKeys.SHOW_MOBILE_DATA_TUTORIAL_ON_IOS,
      false
    );
  }
}

const enum PrefKeys {
  SHOW_MOBILE_DATA_TUTORIAL_ON_IOS = 'GO_PRO_SHOW_MOBILE_DATA_TUTORIAL_ON_IOS',
}
