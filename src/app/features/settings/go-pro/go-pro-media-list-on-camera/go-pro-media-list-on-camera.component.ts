import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { GoProFile } from '../go-pro-media-file';
import { GoProBluetoothService } from '../services/go-pro-bluetooth.service';
import { GoProMediaService } from '../services/go-pro-media.service';
import { GoProWifiService } from '../services/go-pro-wifi.service';

@Component({
  selector: 'app-go-pro-media-list-on-camera',
  templateUrl: './go-pro-media-list-on-camera.component.html',
  styleUrls: ['./go-pro-media-list-on-camera.component.scss'],
})
export class GoProMediaListOnCameraComponent implements OnInit {
  allMediaFiles: GoProFile[] = [];
  shouldConnectToWiFi: boolean = false;

  fetchingFiles: boolean = false;
  fetchingFilesError: string | undefined;

  connectedWifiSSID: string | null = null;
  isConnectedToGoProWifi: boolean | undefined;

  constructor(
    private location: Location,
    private goProMediaService: GoProMediaService,
    private goProBluetoothService: GoProBluetoothService,
    private goProWifiService: GoProWifiService,
    public toastController: ToastController
  ) {}

  async ngOnInit() {
    this.checkWiFiConnection();
  }
  async checkWiFiConnection() {
    this.connectedWifiSSID = await this.goProWifiService.getConnectedWifiSSID();
    this.isConnectedToGoProWifi =
      await this.goProWifiService.isConnectedToGoProWifi();

    if (this.isConnectedToGoProWifi) {
      this.fetchFilesFromGoProWiFi();
    }
  }
  async fetchFilesFromGoProWiFi() {
    const result = await this.goProMediaService.getFilesFromGoPro();
    this.allMediaFiles = result;
  }

  async connectToGoProWifi() {
    try {
      this.connectedWifiSSID = await this.goProWifiService.connectToGoProWiFi();
      await this.fetchFilesFromGoProWiFi();
    } catch (error) {
      console.log(
        '🚀 ~ file: go-pro-media-list-on-camera.component.ts ~ line 46 ~ GoProMediaListOnCameraComponent ~ connectToGoProWifi ~ error',
        error
      );
      this.presentToast(JSON.stringify(error));
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 1700,
    });
    toast.present();
  }

  goBack() {
    this.location.back();
  }
}
