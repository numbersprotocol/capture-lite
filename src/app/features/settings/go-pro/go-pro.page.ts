import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ScanResult } from '@capacitor-community/bluetooth-le';
import { WifiPlugin } from '@capacitor-community/wifi';
import { Plugins } from '@capacitor/core';
import { ToastController } from '@ionic/angular';
import { GoProBluetoothService } from './services/go-pro-bluetooth.service';
import { GoProMediaService } from './services/go-pro-media.service';

const Wifi: WifiPlugin = Plugins.Wifi as WifiPlugin;

interface GoProWiFiCreds {
  wifiPASS: string;
  wifiSSID: string;
}

@Component({
  selector: 'app-go-pro',
  templateUrl: './go-pro.page.html',
  styleUrls: ['./go-pro.page.scss'],
})
export class GoProPage implements OnInit {
  bluetoothScanResults: ScanResult[] = [];
  bluetoothIsScanning = false;

  bluetoothConnectedDevice?: ScanResult;

  readonly goproBaseUrl = 'http://10.5.5.9:8080';

  /**
   * @goProControlAndQueryServiceUUID {string} - Should be FEA6.
   * https://gopro.github.io/OpenGoPro/ble#services-and-characteristics
   * and 128-bit version will be 0000fea6-0000-1000-8000-00805f9b34fb
   * passing FEA6 (16-bit version) does not work
   * you can read more here https://github.com/gopro/OpenGoPro/discussions/41#discussion-3530421
   */
  //
  readonly goProControlAndQueryServiceUUID =
    '0000fea6-0000-1000-8000-00805f9b34fb'.toUpperCase();

  readonly goProWifiAccessPointServiceUUID =
    `b5f90001-aa8d-11e3-9046-0002a5d5c51b`.toUpperCase();

  readonly goProCommandReqCharacteristicsUUID =
    'b5f90072-aa8d-11e3-9046-0002a5d5c51b'.toUpperCase();

  readonly goProWifiSSIDCharacteristicUUID =
    `b5f90002-aa8d-11e3-9046-0002a5d5c51b`.toUpperCase();

  readonly goProWifiPASSCharacteristicUUID =
    `b5f90003-aa8d-11e3-9046-0002a5d5c51b`.toUpperCase();

  readonly shutdownCommand = [0x01, 0x05];

  readonly shutterCommand = [0x03, 0x01, 0x01, 0x01];

  readonly enableGoProWiFiCommand = [0x03, 0x17, 0x01, 0x01];

  constructor(
    public toastController: ToastController,
    private goProMediaService: GoProMediaService,
    private router: Router,
    private goProBluetoothService: GoProBluetoothService
  ) {}
  ngOnDestroy(): void {}

  ngOnInit() {
    this.restoreBluetoothConnection();
    // this.scanForBluetoothDevices();
  }

  async restoreBluetoothConnection() {
    const currentlyConnectedBluetoothDevice =
      await this.goProBluetoothService.getConnectedDevice();
    debugger;
    if (currentlyConnectedBluetoothDevice) {
      this.bluetoothScanResults = [currentlyConnectedBluetoothDevice];
      this.bluetoothConnectedDevice = currentlyConnectedBluetoothDevice;
      return;
    }
  }

  async scanForBluetoothDevices() {
    try {
      this.bluetoothIsScanning = true;
      this.bluetoothScanResults =
        await this.goProBluetoothService.scanForBluetoothDevices();
      this.bluetoothIsScanning = false;
    } catch (error) {
      this.bluetoothScanResults = [];
      this.bluetoothIsScanning = false;
      console.error('scanForBluetoothDevices', error);
    }
  }

  async connectToBluetoothDevice(scanResult: ScanResult) {
    try {
      await this.goProBluetoothService.connectToBluetoothDevice(scanResult);
      this.bluetoothConnectedDevice = scanResult;
      this.presentToast(`🅱 Connected to ${scanResult.device.name}`);
    } catch (error) {
      console.log(JSON.stringify(error, null, 2));
      this.presentToast(JSON.stringify(error));
    }
  }

  async disconnectFromBluetoothDevice(scanResult: ScanResult) {
    try {
      await this.goProBluetoothService.disconnectFromBluetoothDevice(
        scanResult
      );
      this.bluetoothConnectedDevice = undefined;

      const device = scanResult.device;
      alert(`disconnected from device ${device.name ?? device.deviceId}`);
    } catch (error) {
      console.error('disconnectFromDevice', error);
    }
  }

  async sendBluetoothWriteCommand(command: number[]) {
    try {
      await this.goProBluetoothService.sendBluetoothWriteCommand(command);
      this.presentToast('command sent');
    } catch (error) {
      console.log(
        '🚀 ~ file: go-pro.page.ts ~ GoProPage ~ sendBluetoothWriteCommand ~ sendBluetoothWriteCommand',
        error
      );
      this.presentToast(JSON.stringify(error));
    }
  }

  async sendBluetoothReadCommand(command: number[]) {
    try {
      await this.goProBluetoothService.sendBluetoothReadCommand(command);
      this.presentToast('command sent');
    } catch (error) {
      console.log(`error: ${JSON.stringify(error)}`);
      this.presentToast(JSON.stringify(error));
    }
  }

  sendWiFiReadCommand() {
    // TODO: && check if wifi was connected
    if (!this.bluetoothConnectedDevice) {
      return;
    }
    throw new Error('Method not implemented.');
  }

  sendWifiWriteCommand() {
    if (!this.bluetoothConnectedDevice) {
      return;
    }
    throw new Error('Method not implemented.');
  }

  async getGoProWiFiCreds(): Promise<GoProWiFiCreds | undefined> {
    // @ts-ignore
    const device = this.bluetoothConnectedDevice.device;

    try {
      const { wifiSSID, wifiPASS } =
        await this.goProBluetoothService.getGoProWiFiCreds();

      this.presentToast(`GoPro WiFi SSID: ${wifiSSID} PASS: ${wifiPASS}`);
      console.log({ wifiSSID, wifiPASS });

      return { wifiSSID, wifiPASS };
    } catch (error) {
      console.error('getGoProWiFiCreds', JSON.stringify(error));
      this.presentToast(`❌ ${JSON.stringify(error)}`);
      return undefined;
    }
  }

  async connectToGoProWifi() {
    // TODO: use goProBluetoothService

    // try {
    //   await this.goProBluetoothService.connectToGoProWiFi();
    //   this.presentToast(`Connected to GoPro WiFi`);
    // } catch (error) {
    //   console.error(`connectToGoProWifi.error`);
    //   console.error(error);
    //   this.presentToast(
    //     `await Wifi.connect() catch() ${JSON.stringify(error)}`
    //   );
    // }

    if (!this.bluetoothConnectedDevice) {
      return;
    }

    await this.sendBluetoothWriteCommand(this.enableGoProWiFiCommand);
    // @ts-ignore
    const { wifiSSID, wifiPASS } = await this.getGoProWiFiCreds();

    try {
      // this.presentToast(`Wifi.connectPrefix`);
      // console.log(`Connecting to ${wifiSSID} with password ${wifiPASS}`);
      // await Wifi.connectPrefix({
      //   ssid: wifiSSID,
      //   password: wifiPASS,
      // })
      this.presentToast(`Wifi.connect`);
      console.log(`Connecting to ${wifiSSID} with password ${wifiPASS}`);
      await Wifi.connect({
        ssid: wifiSSID,
        password: wifiPASS,
      })
        .then(result => {
          console.warn(`connectToGoProWifi.result`, result);
          this.presentToast(`Connected to ${JSON.stringify(result.ssid)}`);
        })
        .catch((error: any) => {
          console.error(`connectToGoProWifi.error`);
          console.error(error);
          this.presentToast(`Wifi.connect().catch() ${JSON.stringify(error)}`);
        });
    } catch (error) {
      console.error(`connectToGoProWifi.error`);
      console.error(error);
      this.presentToast(
        `await Wifi.connect() catch() ${JSON.stringify(error)}`
      );
    }
  }

  async showFilesOnGoPro() {
    this.router.navigate(['/settings', 'go-pro', 'media-list-on-camera']);
  }

  async showFilesOnDevice() {
    this.router.navigate(['/settings', 'go-pro', 'media-list-on-device']);
  }

  clearGoProMediaStorage() {
    this.goProMediaService.clearStorage();
    // TODO: go through file system and delete actual files too
  }

  printGoProMediaStorage() {
    this.goProMediaService.printGoProMediaStorage();
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 1700,
    });
    toast.present();
  }
}
