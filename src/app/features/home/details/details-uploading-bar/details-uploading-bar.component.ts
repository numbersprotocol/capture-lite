import { Component } from '@angular/core';
import { DiaBackendAssetUploadingService } from '../../../../shared/dia-backend/asset/uploading/dia-backend-asset-uploading.service';

@Component({
  selector: 'app-details-uploading-bar',
  templateUrl: './details-uploading-bar.component.html',
  styleUrls: ['./details-uploading-bar.component.scss'],
})
export class DetailsUploadingBarComponent {
  readonly networkConnected$ = this.uploadService.networkConnected$;

  constructor(
    private readonly uploadService: DiaBackendAssetUploadingService
  ) {}
}
