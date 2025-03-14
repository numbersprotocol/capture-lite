import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ScanResult } from '@capacitor-community/bluetooth-le';
import {
  CapacitorWifiConnect,
  ConnectState,
} from '@falconeta/capacitor-wifi-connect';
import { LoadingController, ToastController } from '@ionic/angular';
import { GoProBluetoothService } from './services/go-pro-bluetooth.service';

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

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  readonly enableGoProWiFiCommand = [0x03, 0x17, 0x01, 0x01];

  constructor(
    public toastController: ToastController,
    private readonly loadingController: LoadingController,
    private readonly router: Router,
    private readonly goProBluetoothService: GoProBluetoothService
  ) {}

  ngOnInit() {
    this.restoreBluetoothConnection();
  }

  async restoreBluetoothConnection() {
    const currentlyConnectedBluetoothDevice =
      await this.goProBluetoothService.getConnectedDevice();

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
    } finally {
      this.bluetoothIsScanning = false;
    }
  }

  async connectToBluetoothDevice(scanResult: ScanResult) {
    const loading = await this.loadingController.create({
      message: `Connecting to ${scanResult.device.name}`,
    });

    try {
      await loading.present();
      await this.goProBluetoothService.connectToBluetoothDevice(scanResult);
      await this.goProBluetoothService.pairDevice();

      this.bluetoothConnectedDevice = scanResult;
      await loading.dismiss();
      this.presentToast(`🅱 Connected to ${scanResult.device.name}`);
    } catch (error) {
      await loading.dismiss();
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
      this.presentToast(JSON.stringify(error));
    }
  }

  async sendBluetoothWriteCommand(command: number[]) {
    try {
      await this.goProBluetoothService.sendBluetoothWriteCommand(command);
      this.presentToast('command sent');
    } catch (error) {
      this.presentToast(JSON.stringify(error));
    }
  }

  async sendBluetoothReadCommand(command: number[]) {
    try {
      await this.goProBluetoothService.sendBluetoothReadCommand(command);
      this.presentToast('command sent');
    } catch (error) {
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
    try {
      const { wifiSSID, wifiPASS } =
        await this.goProBluetoothService.getGoProWiFiCreds();

      this.presentToast(`GoPro WiFi SSID: ${wifiSSID} PASS: ${wifiPASS}`);

      return { wifiSSID, wifiPASS };
    } catch (error) {
      this.presentToast(`❌ ${JSON.stringify(error)}`);
      return undefined;
    }
  }

  async connectToGoProWifi() {
    if (!this.bluetoothConnectedDevice) {
      return;
    }

    await this.sendBluetoothWriteCommand(this.enableGoProWiFiCommand);

    const creds = await this.getGoProWiFiCreds();
    if (!creds) return;

    const { wifiSSID, wifiPASS } = creds;

    try {
      this.presentToast(`Wifi.connect`);
      let { value } = await CapacitorWifiConnect.checkPermission();
      if (value === 'prompt') {
        const data = await CapacitorWifiConnect.requestPermission();
        value = data.value;
      }
      if (value !== 'granted') {
        this.presentToast('Permission denied');
        return;
      }
      const result = await CapacitorWifiConnect.secureConnect({
        ssid: wifiSSID,
        password: wifiPASS,
      });
      if (result.value === ConnectState.Ok) {
        this.presentToast(`Connected to ${JSON.stringify(wifiSSID)}`);
      } else {
        this.presentToast(`Failed to connect to ${JSON.stringify(wifiSSID)}`);
      }
    } catch (error) {
      this.presentToast(`${JSON.stringify(error)}`);
    }
  }

  async showFilesOnGoPro() {
    this.router.navigate(['/settings', 'go-pro', 'media-list-on-camera']);
  }

  async showFilesOnDevice() {
    this.router.navigate(['/settings', 'go-pro', 'media-list-on-device']);
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 1700,
    });
    toast.present();
  }
}
