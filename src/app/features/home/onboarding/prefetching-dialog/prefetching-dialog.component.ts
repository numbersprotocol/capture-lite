import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DiaBackendAssetPrefetchingService } from '../../../../shared/services/dia-backend/asset/prefetching/dia-backend-asset-prefetching.service';
import { OnboardingService } from '../../../../shared/services/onboarding/onboarding.service';

@Component({
  selector: 'app-prefetching-dialog',
  templateUrl: './prefetching-dialog.component.html',
  styleUrls: ['./prefetching-dialog.component.scss'],
})
export class PrefetchingDialogComponent {
  progress = 0;

  constructor(
    private readonly dialogRef: MatDialogRef<PrefetchingDialogComponent>,
    private readonly diaBackendAssetPrefetchingService: DiaBackendAssetPrefetchingService,
    private readonly onboardingService: OnboardingService
  ) {
    this.prefetch();
  }

  private async prefetch() {
    try {
      await this.diaBackendAssetPrefetchingService.prefetch(
        (currentCount, totalCount) =>
          (this.progress = currentCount / totalCount)
      );
      await this.onboardingService.setHasPrefetchedDiaBackendAssets(true);
    } finally {
      this.dialogRef.close();
    }
  }
}
