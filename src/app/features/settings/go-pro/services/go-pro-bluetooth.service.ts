import { Injectable } from '@angular/core';
import {
  BleClient,
  dataViewToText,
  numbersToDataView,
  ScanResult,
} from '@capacitor-community/bluetooth-le';
import { CapacitorWifiConnect } from '@falconeta/capacitor-wifi-connect';
import { isPlatform } from '@ionic/core';
import { isEqual } from 'lodash-es';
import { BehaviorSubject } from 'rxjs';
import { PreferenceManager } from '../../../../shared/preference-manager/preference-manager.service';

interface GoProWiFiCreds {
  wifiPASS: string;
  wifiSSID: string;
}

@Injectable({
  providedIn: 'root',
})
export class GoProBluetoothService {
  private readonly GO_PRO_BLUETOOTH_STORAGE_KEY =
    'GO_PRO_BLUETOOTH_STORAGE_KEY';

  /**
   * @goProControlAndQueryServiceUUID {string} - Should be FEA6.
   * https://gopro.github.io/OpenGoPro/ble#services-and-characteristics
   * and 128-bit version will be 0000fea6-0000-1000-8000-00805f9b34fb
   * passing FEA6 (16-bit version) does not work
   * you can read more here https://github.com/gopro/OpenGoPro/discussions/41#discussion-3530421
   */
  //
  private readonly goProControlAndQueryServiceUUID =
    '0000fea6-0000-1000-8000-00805f9b34fb'.toUpperCase();

  private readonly goProWifiAccessPointServiceUUID =
    `b5f90001-aa8d-11e3-9046-0002a5d5c51b`.toUpperCase();

  private readonly goProCommandReqCharacteristicsUUID =
    'b5f90072-aa8d-11e3-9046-0002a5d5c51b'.toUpperCase();

  private readonly goProWifiSSIDCharacteristicUUID =
    `b5f90002-aa8d-11e3-9046-0002a5d5c51b`.toUpperCase();

  private readonly goProWifiPASSCharacteristicUUID =
    `b5f90003-aa8d-11e3-9046-0002a5d5c51b`.toUpperCase();

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  private readonly shutdownCommand = [0x01, 0x05];

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  private readonly shutterCommand = [0x03, 0x01, 0x01, 0x01];

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  private readonly enableGoProWiFiCommand = [0x03, 0x17, 0x01, 0x01];

  private hasInitialized = false;

  readonly id = 'GoProBluetoothService';

  private readonly preferences = this.preferenceManager.getPreferences(this.id);

  readonly connectedDevice$ = new BehaviorSubject<ScanResult | undefined>(
    undefined
  );

  readonly lastConnectedDevice$ = this.preferences.getString$(
    PrefKeys.LAST_CONNECTED_BLUETOOTH_DEVICE
  );

  constructor(private readonly preferenceManager: PreferenceManager) {}

  private async initialize() {
    if (this.hasInitialized) {
      return;
    }

    try {
      await BleClient.initialize();
      this.hasInitialized = true;
    } catch (err: any) {
      if (
        err instanceof Error &&
        err.message === 'Web Bluetooth API not available in this browser.'
      ) {
        return;
      }
      throw new Error(err.message);
    }
  }

  async scanForBluetoothDevices(): Promise<ScanResult[]> {
    if (!isPlatform('hybrid')) {
      // bluetooth plugin does not support web yet
      return [];
    }

    const bluetoothScanResults: ScanResult[] = [];

    await this.initialize();

    BleClient.requestLEScan(
      { services: [this.goProControlAndQueryServiceUUID] },
      (foundDevice: any) => bluetoothScanResults.push(foundDevice)
    );

    await new Promise(resolve => {
      const stopScanAfterMilliSeconds = 2000;
      setTimeout(resolve, stopScanAfterMilliSeconds);
    });

    await BleClient.stopLEScan();

    return bluetoothScanResults;
  }

  async connectToBluetoothDevice(scanResult: ScanResult) {
    await this.initialize();
    await BleClient.disconnect(scanResult.device.deviceId);
    await BleClient.connect(scanResult.device.deviceId, _ => {
      this.onDisconnectedFromBluetoothDevice(scanResult);
    });
    await this.saveConnectedDeviceToStorage(scanResult);
  }

  onDisconnectedFromBluetoothDevice(scanResult: ScanResult) {
    this.removeConnectedDeviceFromStorage(scanResult);
  }

  async disconnectFromBluetoothDevice(scanResult: ScanResult) {
    await BleClient.disconnect(scanResult.device.deviceId);
    this.removeConnectedDeviceFromStorage(scanResult);
  }

  private async getConnectedDeviceFromStorage(): Promise<
    ScanResult | undefined
  > {
    const res = await this.preferences.getString(
      PrefKeys.LAST_CONNECTED_BLUETOOTH_DEVICE
    );
    if (res !== '') {
      return JSON.parse(res) as ScanResult;
    }
  }

  async saveConnectedDeviceToStorage(scanResult: ScanResult) {
    await this.preferences.setString(
      PrefKeys.LAST_CONNECTED_BLUETOOTH_DEVICE,
      JSON.stringify(scanResult)
    );
    this.connectedDevice$.next(scanResult);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async removeConnectedDeviceFromStorage(scanResult: ScanResult) {
    await this.preferences.setString(
      PrefKeys.LAST_CONNECTED_BLUETOOTH_DEVICE,
      ''
    );
    this.connectedDevice$.next(undefined);
  }

  async getConnectedDevice(): Promise<ScanResult | undefined> {
    const connectedDevice = await this.getConnectedDeviceFromStorage();
    if (connectedDevice !== undefined) {
      try {
        const creds = await this.getGoProWiFiCreds();
        if (creds.wifiSSID && creds.wifiPASS) {
          return connectedDevice;
        }
        await this.removeConnectedDeviceFromStorage(connectedDevice);
      } catch (error) {
        await this.removeConnectedDeviceFromStorage(connectedDevice);
      }
    }
  }

  async checkBluetoothDeviceConnection() {
    const connectedDevice = await this.getConnectedDeviceFromStorage();
    if (connectedDevice === undefined) {
      throw new Error('GoPro not connected via bluetooth');
    } else {
      // TODO: for some reason after leaving page we need to connect again
      // await this.connectToBluetoothDevice(this.connectedBluetoothDevice);
    }
  }

  async sendBluetoothWriteCommand(command: number[]) {
    await this.initialize();
    await this.checkBluetoothDeviceConnection();
    const connectedDevice = await this.getConnectedDeviceFromStorage();

    if (!connectedDevice) return;

    await BleClient.write(
      connectedDevice.device.deviceId,
      this.goProControlAndQueryServiceUUID,
      this.goProCommandReqCharacteristicsUUID,
      numbersToDataView(command)
    );
  }

  async sendBluetoothReadCommand(command: number[]) {
    await this.initialize();
    await this.checkBluetoothDeviceConnection();

    if (isEqual(command, this.shutdownCommand)) {
      this.getGoProWiFiCreds();
    }

    // TODO: add other read commands if necessary
  }

  async getGoProWiFiCreds(): Promise<GoProWiFiCreds> {
    await this.checkBluetoothDeviceConnection();
    const connectedDevice = await this.getConnectedDeviceFromStorage();

    const wifiSSID = dataViewToText(
      await BleClient.read(
        connectedDevice!.device.deviceId,
        this.goProWifiAccessPointServiceUUID,
        this.goProWifiSSIDCharacteristicUUID
      )
    );

    const wifiPASS = dataViewToText(
      await BleClient.read(
        connectedDevice!.device.deviceId,
        this.goProWifiAccessPointServiceUUID,
        this.goProWifiPASSCharacteristicUUID
      )
    );

    return { wifiSSID, wifiPASS };
  }

  async enableGoProWifi() {
    await this.sendBluetoothWriteCommand(this.enableGoProWiFiCommand);
  }

  async connectToGoProWiFi() {
    await this.sendBluetoothWriteCommand(this.enableGoProWiFiCommand);

    const wifiCreds = await this.getGoProWiFiCreds();
    let { value } = await CapacitorWifiConnect.checkPermission();
    if (value === 'prompt') {
      const data = await CapacitorWifiConnect.requestPermission();
      value = data.value;
    }
    if (value === 'granted') {
      await CapacitorWifiConnect.secureConnect({
        ssid: wifiCreds.wifiSSID,
        password: wifiCreds.wifiPASS,
      });
    }
  }

  /** Trigger pairing between device and GoPro.
   *
   * Because '@capacitor-community/bluetooth-le' have no such command pair device. However we can
   * send any bluetooth read command to trigger pairing if connected for the first time.
   * For example: it can be get wifi credentials command
   */
  async pairDevice(): Promise<void> {
    await this.initialize();
    await this.getGoProWiFiCreds();
  }
}

const enum PrefKeys {
  LAST_CONNECTED_BLUETOOTH_DEVICE = 'GO_PRO_LAST_CONNECTED_BLUETOOTH_DEVICE',
}
