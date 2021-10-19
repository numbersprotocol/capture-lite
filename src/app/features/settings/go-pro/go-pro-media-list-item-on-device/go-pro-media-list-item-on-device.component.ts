import { Component, Input, OnInit } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { GoProFileOnDevice } from '../go-pro-media-file';
import { GoProMediaService } from '../services/go-pro-media.service';

@Component({
  selector: 'app-go-pro-media-list-item-on-device',
  templateUrl: './go-pro-media-list-item-on-device.component.html',
  styleUrls: ['./go-pro-media-list-item-on-device.component.scss'],
})
export class GoProMediaListItemOnDeviceComponent implements OnInit {
  @Input() goProFileOnDevice!: GoProFileOnDevice;

  thumbnailSrc?: string | SafeUrl;

  constructor(
    private router: Router,
    private goProMediaService: GoProMediaService
  ) {}

  async ngOnInit() {
    this.thumbnailSrc = await this.goProMediaService.getFileSrcFromDevice(
      this.goProFileOnDevice.thumbnailUrl
    );
  }

  showDetails() {
    this.router.navigate(
      ['/settings', 'go-pro', 'media-item-detail-on-device'],
      {
        state: { goProFileOnDevice: this.goProFileOnDevice },
      }
    );
  }
}
