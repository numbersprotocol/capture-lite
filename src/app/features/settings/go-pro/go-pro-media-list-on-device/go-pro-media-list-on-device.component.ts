import { Component, OnInit } from '@angular/core';
import { GoProFileOnDevice } from '../go-pro-media-file';
import { GoProMediaService } from '../services/go-pro-media.service';

@Component({
  selector: 'app-go-pro-media-list-on-device',
  templateUrl: './go-pro-media-list-on-device.component.html',
  styleUrls: ['./go-pro-media-list-on-device.component.scss'],
})
export class GoProMediaListOnDeviceComponent implements OnInit {
  goProFilesOnDevice: GoProFileOnDevice[] = [];

  constructor(public goProMediaService: GoProMediaService) {}

  async ngOnInit() {
    this.goProFilesOnDevice =
      await this.goProMediaService.loadFilesFromStorage();
  }
}
