import { Location } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NetworkPlugin } from '@capacitor/core';
import { AlertController, ToastController } from '@ionic/angular';
import { NETOWRK_PLUGIN } from '../../../../shared/capacitor-plugins/capacitor-plugins.module';
import { GoProFileOnDevice } from '../go-pro-media-file';
import { GoProMediaService } from '../services/go-pro-media.service';
import { GoProWifiService } from '../services/go-pro-wifi.service';

@Component({
  selector: 'app-go-pro-media-item-detail-on-device',
  templateUrl: './go-pro-media-item-detail-on-device.component.html',
  styleUrls: ['./go-pro-media-item-detail-on-device.component.scss'],
})
export class GoProMediaItemDetailOnDeviceComponent implements OnInit {
  goProFileOnDevice?: GoProFileOnDevice;

  url?: string | SafeUrl;

  constructor(
    private readonly router: Router,
    private readonly location: Location,
    private readonly route: ActivatedRoute,
    public goProMediaService: GoProMediaService,
    public goProWiFiService: GoProWifiService,
    @Inject(NETOWRK_PLUGIN)
    private readonly networkPlugin: NetworkPlugin,
    public alertController: AlertController,
    public toastController: ToastController
  ) {
    this.route.queryParams.subscribe(() => {
      const state = this.router.getCurrentNavigation()?.extras.state;
      if (state) {
        this.goProFileOnDevice = state.goProFileOnDevice;
      }
    });
  }

  async ngOnInit() {
    if (this.goProFileOnDevice) {
      this.url = await this.goProMediaService.getFileSrcFromDevice(
        this.goProFileOnDevice.url
      );
    }
  }

  goBack() {
    this.location.back();
  }

  async uploadToCapture() {
    const newtorkStatus = await this.networkPlugin.getStatus();

    if (newtorkStatus.connectionType == 'wifi') {
      const connectedToGoProWiFi =
        await GoProWifiService.isConnectedToGoProWifi();

      if (!connectedToGoProWiFi) {
        this.startUploadToCapture();
        return;
      }
    }

    if (newtorkStatus.connectionType == 'cellular') {
      const allowed = await this.allowUploadWithMobileInternet();
      if (allowed) {
        this.startUploadToCapture();
      }
    }
  }

  private async startUploadToCapture() {
    try {
      await this.presentToast(`✅ Upload added to the queue, see Home Page`);
      await this.goProMediaService.uploadToCaptureFromDevice(
        this.goProFileOnDevice
      );
    } catch (error) {
      await this.presentToast(`❌ Failed to upload`);
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 1700,
    });
    toast.present();
  }

  async allowUploadWithMobileInternet() {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<boolean>(async resolve => {
      const alert = await this.alertController.create({
        header: 'Warning!',
        message:
          'You are using mobile data to upload file!' +
          '<strong>Do you want to continue?</strong>',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              resolve(false);
            },
          },
          {
            text: 'Okay',
            handler: () => {
              resolve(true);
            },
          },
        ],
      });
      await alert.present();
    });
  }
}
