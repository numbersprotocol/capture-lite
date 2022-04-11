import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  NavController,
  Platform,
  ToastController,
} from '@ionic/angular';
import { ErrorService } from '../../../../shared/error/error.service';
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
  shouldConnectToWiFi = false;

  fetchingFiles = false;
  fetchingFilesError: string | undefined;

  connectedWifiSSID: string | null = null;
  isConnectedToGoProWifi: boolean | undefined;
  isConnectingToGoProWifi: boolean | undefined;

  isScrollingContent = false;

  multiSelectMode = false;
  selectedGoProFiles: GoProFile[] = [];

  filesToUpload: GoProFile[] = [];
  uploadInProgress = false;

  constructor(
    private readonly location: Location,
    private readonly goProMediaService: GoProMediaService,
    private readonly router: Router,
    private readonly navCtrl: NavController,
    private readonly alertCtrl: AlertController,
    private readonly goProBluetoothService: GoProBluetoothService,
    private readonly goProWifiService: GoProWifiService,
    private readonly platform: Platform,
    private readonly errorService: ErrorService,
    public toastController: ToastController
  ) {}

  ngOnInit() {
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
    try {
      this.fetchingFilesError = undefined;
      this.fetchingFiles = true;
      this.allMediaFiles = await this.goProMediaService.getFilesFromGoPro();
    } catch (error: any) {
      this.fetchingFilesError = 'Failed to fetch media from GoPro';
      if (this.platform.is('ios')) {
        this.fetchingFilesError =
          'Please check iOS Settings > Capture > Local Network, make sure the permission of Local Network is allowed Capture app.';
      }
      this.allMediaFiles = [];
    } finally {
      this.fetchingFiles = false;
    }
  }

  async connectToGoProWifi() {
    try {
      this.isConnectingToGoProWifi = true;

      if (!(await this.goProBluetoothService.getConnectedDevice())) {
        await this.errorService
          .toastError$('Connect to GoPro via bluetooth first')
          .toPromise();
        // I need to show alert because when catching error below for some reason it's empty
        throw new Error('Connect to GoPro via bluetooth first');
      }
      this.connectedWifiSSID = await this.goProWifiService.connectToGoProWiFi();
      this.isConnectedToGoProWifi = true;
      await this.fetchFilesFromGoProWiFi();
    } catch (error) {
      this.presentToast(JSON.stringify(error));
    } finally {
      this.isConnectingToGoProWifi = false;
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

  onItemClick(item: GoProFile) {
    if (!this.multiSelectMode) {
      this.router.navigate(
        ['/settings', 'go-pro', 'media-item-detail-on-camera'],
        { state: { goProMediaFile: item } }
      );
    } else if (!this.isItemInSelectedList(item)) {
      this.selectedGoProFiles.push(item);
    } else {
      this.selectedGoProFiles = this.selectedGoProFiles.filter(
        i => i.url !== item.url
      );
    }
  }

  async uploadSelectedFiles() {
    for (const selectedFile of this.selectedGoProFiles) {
      if (this.isItemInUploadList(selectedFile) === false) {
        this.filesToUpload.push(selectedFile);
      }
    }

    this.exitMultiSelectMode();

    if (!this.uploadInProgress) {
      this.uploadInProgress = true;

      while (this.filesToUpload.length > 0) {
        const fileToUpload = this.filesToUpload.shift();

        const uploadResult =
          await this.goProMediaService.uploadToCaptureFromGoProCamera(
            fileToUpload
          );

        if (uploadResult.isDownloaded && uploadResult.isCaptured === false) {
          this.fileWasUploadedBefore(fileToUpload);
        }
      }

      this.uploadInProgress = false;
      this.navigateToHomeScreen();
    }
  }

  async fileWasUploadedBefore(fileToUpload: GoProFile | undefined) {
    if (!fileToUpload) return;

    const alert = await this.alertCtrl.create({
      cssClass: 'go-pro-alert-message-with',
      header: 'File Upload Error!',
      subHeader: 'File Previously Uploaded.',
      message: `<img src="${fileToUpload.thumbnailUrl}"  loading="lazy" decoding="async">`,
      buttons: ['OK'],
    });

    await alert.present();

    await alert.onDidDismiss();
  }

  private async navigateToHomeScreen() {
    // this.navCtrl.navigateRoot('/');
    await this.navCtrl.pop();
    await this.navCtrl.pop();
    await this.navCtrl.pop();
  }

  ionScrollStart() {
    this.isScrollingContent = true;
  }

  ionScrollEnd() {
    this.isScrollingContent = false;
  }

  enterMultiSelectMode(firstSelectedItem?: GoProFile) {
    if (this.multiSelectMode) return;
    if (this.isScrollingContent) return;
    if (firstSelectedItem) this.selectedGoProFiles.push(firstSelectedItem);
    this.multiSelectMode = true;
  }

  exitMultiSelectMode() {
    this.multiSelectMode = false;
    this.selectedGoProFiles = [];
  }

  isItemInSelectedList(item: GoProFile) {
    return this.selectedGoProFiles.find(i => i.url === item.url) !== undefined;
  }

  isItemInUploadList(item: GoProFile) {
    return this.filesToUpload.find(i => i.url === item.url) !== undefined;
  }

  onUploadCancel() {
    this.uploadInProgress = false;
    this.filesToUpload = [];
  }
}
