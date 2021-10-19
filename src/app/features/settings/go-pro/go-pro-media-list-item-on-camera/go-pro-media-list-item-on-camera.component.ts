import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GoProFile } from '../go-pro-media-file';
import { GoProMediaService } from '../services/go-pro-media.service';

@Component({
  selector: 'app-go-pro-media-list-item-on-camera',
  templateUrl: './go-pro-media-list-item-on-camera.component.html',
  styleUrls: ['./go-pro-media-list-item-on-camera.component.scss'],
})
export class GoProMediaListItemOnCameraComponent implements OnInit {
  @Input() mediaFile: GoProFile | undefined;
  mediaType: 'unknown' | 'video' | 'image' = 'unknown';

  constructor(
    private router: Router,
    public goProMediaService: GoProMediaService
  ) {}

  ngOnInit() {}

  showDetails() {
    this.router.navigate(
      ['/settings', 'go-pro', 'media-item-detail-on-camera'],
      {
        state: { goProMediaFile: this.mediaFile },
      }
    );
  }
}
