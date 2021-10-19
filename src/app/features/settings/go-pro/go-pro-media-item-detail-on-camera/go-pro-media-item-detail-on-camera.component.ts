import { Location } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NetworkPlugin } from '@capacitor/core';
import {
  AlertController,
  LoadingController,
  ToastController,
} from '@ionic/angular';
import { NETOWRK_PLUGIN } from '../../../../shared/capacitor-plugins/capacitor-plugins.module';
import { GoProFile } from '../go-pro-media-file';
import { GoProMediaService } from '../services/go-pro-media.service';
import { GoProWifiService } from '../services/go-pro-wifi.service';

@Component({
  selector: 'app-go-pro-media-item-detail-on-camera',
  templateUrl: './go-pro-media-item-detail-on-camera.component.html',
  styleUrls: ['./go-pro-media-item-detail-on-camera.component.scss'],
})
export class GoProMediaItemDetailOnCameraComponent implements OnInit {
  mediaFile: GoProFile | undefined;

  mediaType: 'unknown' | 'image' | 'video' = 'unknown';

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    public toastController: ToastController,
    public alertController: AlertController,
    public loadingController: LoadingController,
    public goProMediaService: GoProMediaService,
    public goProWiFiService: GoProWifiService,
    @Inject(NETOWRK_PLUGIN)
    private readonly networkPlugin: NetworkPlugin
  ) {
    this.route.queryParams.subscribe(params => {
      const state = this.router.getCurrentNavigation()?.extras.state;
      if (state) {
        this.mediaFile = state.goProMediaFile;
      }
    });
  }

  ngOnInit() {
    this.mediaType = this.goProMediaService.getFileType(this.mediaFile?.url);
  }

  async downloadFileFromGoProCamera() {
    if (!this.mediaFile) {
      return;
    }

    const fileName = this.goProMediaService.extractFileNameFromUrl(
      this.mediaFile.url
    );

    const loading = await this.loadingController.create({
      message: 'Please wait... Download in progress',
    });
    await loading.present();

    try {
      // TODO: reimplement download with capacitor-community-http plugin
      await this.goProMediaService.downloadFromGoProCamera(this.mediaFile);
      this.presentToast(`${fileName} downloaded ✅`);
    } catch (error) {
      this.presentToast(`Failed to download ${fileName}  ❌`);
      console.log(JSON.stringify(error, null, 2));
    }

    await loading.dismiss();
  }

  async uploadToCapture() {
    const newtorkStatus = await this.networkPlugin.getStatus();
    console.log(JSON.stringify(newtorkStatus, null, 4));

    const allowed = await this.allowUploadWithMobileInternet();
    if (allowed) {
      this.startUploadToCapture();
      return;
    }

    // if (newtorkStatus.connectionType == 'wifi') {
    //   const connectedToGoProWiFi =
    //     await this.goProWiFiService.isConnectedToGoProWifi();

    //   if (!connectedToGoProWiFi) {
    //     this.startUploadToCapture();
    //     return;
    //   }
    // }

    // if (newtorkStatus.connectionType == 'cellular') {
    //   const allowed = await this.allowUploadWithMobileInternet();
    //   if (allowed) {
    //     this.startUploadToCapture();
    //     return;
    //   }
    // }
  }

  private async startUploadToCapture() {
    const loading = await this.loadingController.create({
      message: 'Please wait... loading file',
    });
    await loading.present();
    try {
      await this.goProMediaService.uploadToCaptureFromGoProCamera(
        this.mediaFile
      );
      await loading.dismiss();
      await this.presentToast(`✅ Upload added to the queue, see Home Page`);
    } catch (error) {
      console.log(JSON.stringify(error, null, 4));
      await loading.dismiss();
      await this.presentToast(`❌ Failed to upload`);
    }
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
