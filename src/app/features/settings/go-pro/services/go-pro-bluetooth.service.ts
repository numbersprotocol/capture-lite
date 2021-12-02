import { Injectable } from '@angular/core';
import {
  BleClient,
  dataViewToText,
  numbersToDataView,
  ScanResult,
} from '@capacitor-community/bluetooth-le';
import { Wifi } from '@capacitor-community/wifi';
import { Plugins } from '@capacitor/core';
import { isPlatform } from '@ionic/core';

const { Storage } = Plugins;

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

  private readonly shutdownCommand = [0x01, 0x05];

  private readonly shutterCommand = [0x03, 0x01, 0x01, 0x01];

  private readonly enableGoProWiFiCommand = [0x03, 0x17, 0x01, 0x01];

  constructor() {
    BleClient.initialize();
  }

  async scanForBluetoothDevices(): Promise<ScanResult[]> {
    if (!isPlatform('hybrid')) {
      // bluetooth plugin does not support web yet
      return [];
    }

    let bluetoothScanResults: ScanResult[] = [];

    return new Promise<ScanResult[]>(async (resolve, reject) => {
      try {
        await BleClient.initialize();

        await BleClient.requestLEScan(
          { services: [this.goProControlAndQueryServiceUUID] },
          foundDevice => bluetoothScanResults.push(foundDevice)
        );

        const stopScanAfterMilliSeconds = 2000;
        setTimeout(async () => {
          await BleClient.stopLEScan();
          resolve(bluetoothScanResults);
        }, stopScanAfterMilliSeconds);
      } catch (error) {
        reject(error);
      }
    });
  }

  async connectToBluetoothDevice(scanResult: ScanResult) {
    await BleClient.connect(scanResult.device.deviceId, deviceId => {
      this.onDisconnectedFromBluetoothDevice(scanResult);
    });
    this.saveConnectedDeviceToStorage(scanResult);
  }

  onDisconnectedFromBluetoothDevice(scanResult: ScanResult) {
    this.removeConnectedDeviceFromStorage(scanResult);
  }

  async disconnectFromBluetoothDevice(scanResult: ScanResult) {
    await BleClient.disconnect(scanResult.device.deviceId);
    this.removeConnectedDeviceFromStorage(scanResult);
  }

  async getConnectedDeviceFromStorage(): Promise<ScanResult | undefined> {
    const result = await Storage.get({
      key: this.GO_PRO_BLUETOOTH_STORAGE_KEY,
    });
    if (result.value) {
      return JSON.parse(result.value) as ScanResult;
    }
  }

  async saveConnectedDeviceToStorage(scanResult: ScanResult) {
    await Storage.set({
      key: this.GO_PRO_BLUETOOTH_STORAGE_KEY,
      value: JSON.stringify(scanResult),
    });
  }

  async removeConnectedDeviceFromStorage(scanResult: ScanResult) {
    await Storage.remove({ key: this.GO_PRO_BLUETOOTH_STORAGE_KEY });
  }

  async getConnectedDevice(): Promise<ScanResult | undefined> {
    const connectedDevice = await this.getConnectedDeviceFromStorage();
    if (connectedDevice !== undefined) {
      try {
        const creds = await this.getGoProWiFiCreds();
        if (creds.wifiSSID && creds.wifiPASS) {
          return connectedDevice;
        } else {
          await this.removeConnectedDeviceFromStorage(connectedDevice);
        }
      } catch (error) {
        debugger;
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
    await this.checkBluetoothDeviceConnection();
    const connectedDevice = await this.getConnectedDeviceFromStorage();
    await BleClient.write(
      connectedDevice!.device.deviceId,
      this.goProControlAndQueryServiceUUID,
      this.goProCommandReqCharacteristicsUUID,
      numbersToDataView(command)
    );
  }

  async sendBluetoothReadCommand(command: number[]) {
    await this.checkBluetoothDeviceConnection();

    // TODO: find better solution for comparing 2 arrays with numbers
    if (JSON.stringify(command) === JSON.stringify(this.shutdownCommand)) {
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
    return new Promise(async (resolve, reject) => {
      await this.sendBluetoothWriteCommand(this.enableGoProWiFiCommand);

      const wifiCreds = await this.getGoProWiFiCreds();

      try {
        const result = await Wifi.connect({
          ssid: wifiCreds.wifiSSID,
          password: wifiCreds.wifiPASS,
        });

        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }
}
