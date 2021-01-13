import { Component } from '@angular/core';
import { UploadService } from '../../../../shared/services/upload/upload.service';

@Component({
  selector: 'app-upload-bar',
  templateUrl: './upload-bar.component.html',
  styleUrls: ['./upload-bar.component.scss'],
})
export class UploadBarComponent {
  currentUploadingCount$ = this.uploadService.currentUploadingCount$;
  isPaused$ = this.uploadService.isPaused$;
  isPausedByFailure$ = this.uploadService.isPausedByFailure$;

  constructor(private readonly uploadService: UploadService) {}

  pause() {
    this.uploadService.pause();
  }

  resume() {
    this.uploadService.resume();
  }
}
