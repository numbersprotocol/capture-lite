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
    private router: Router,
    private location: Location,
    private route: ActivatedRoute,
    public goProMediaService: GoProMediaService,
    public goProWiFiService: GoProWifiService,
    @Inject(NETOWRK_PLUGIN)
    private readonly networkPlugin: NetworkPlugin,
    public alertController: AlertController,
    public toastController: ToastController
  ) {
    this.route.queryParams.subscribe(params => {
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
    console.log(JSON.stringify(newtorkStatus, null, 4));

    if (newtorkStatus.connectionType == 'wifi') {
      const connectedToGoProWiFi =
        await this.goProWiFiService.isConnectedToGoProWifi();

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
      console.log(JSON.stringify(error, null, 4));
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
    return new Promise<boolean>(async (resolve, reject) => {
      const alert = await this.alertController.create({
        header: 'Warning!',
        message:
          'You are using mobile data to upload file!' +
          '<strong>Do you want to continue?</strong>',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: blah => {
              console.log('Confirm Cancel');
              resolve(false);
            },
          },
          {
            text: 'Okay',
            handler: () => {
              console.log('Confirm Okay');
              resolve(true);
            },
          },
        ],
      });
      await alert.present();
    });
  }
}
