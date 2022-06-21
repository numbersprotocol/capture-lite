import { Component } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { Platform } from '@ionic/angular';
import { getAppDownloadLink } from '../../../../utils/url';

@Component({
  selector: 'app-update-app-dialog',
  templateUrl: './update-app-dialog.component.html',
  styleUrls: ['./update-app-dialog.component.scss'],
})
export class UpdateAppDialogComponent {
  constructor(private readonly platform: Platform) {}

  async redirectToAppUpdatePage() {
    const url = getAppDownloadLink(this.platform.is.bind(this));
    await Browser.open({ url });
  }
}
