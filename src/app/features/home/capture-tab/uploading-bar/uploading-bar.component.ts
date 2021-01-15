import { Component } from '@angular/core';
import { DiaBackendAssetUploadingService } from '../../../../shared/services/dia-backend/asset/uploading/dia-backend-asset-uploading.service';

@Component({
  selector: 'app-uploading-bar',
  templateUrl: './uploading-bar.component.html',
  styleUrls: ['./uploading-bar.component.scss'],
})
export class UploadingBarComponent {
  currentUploadingCount$ = this.uploadService.currentUploadingCount$;
  isPaused$ = this.uploadService.isPaused$;
  isPausedByFailure$ = this.uploadService.isPausedByFailure$;

  constructor(
    private readonly uploadService: DiaBackendAssetUploadingService
  ) {}

  pause() {
    this.uploadService.pause();
  }

  resume() {
    this.uploadService.resume();
  }
}
