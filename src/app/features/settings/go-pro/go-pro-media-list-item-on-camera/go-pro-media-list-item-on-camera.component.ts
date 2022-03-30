import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { GoProFile } from '../go-pro-media-file';
import { GoProMediaService } from '../services/go-pro-media.service';

@Component({
  selector: 'app-go-pro-media-list-item-on-camera',
  templateUrl: './go-pro-media-list-item-on-camera.component.html',
  styleUrls: ['./go-pro-media-list-item-on-camera.component.scss'],
})
export class GoProMediaListItemOnCameraComponent {
  mediaType: 'unknown' | 'video' | 'image' = 'unknown';
  @Input() mediaFile: GoProFile | undefined;
  @Input() selected = false;

  constructor(
    private readonly router: Router,
    public goProMediaService: GoProMediaService
  ) {}

  showDetails() {
    this.router.navigate(
      ['/settings', 'go-pro', 'media-item-detail-on-camera'],
      {
        state: { goProMediaFile: this.mediaFile },
      }
    );
  }
}
