import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import { ConfirmAlert } from '../../../../shared/services/confirm-alert/confirm-alert.service';
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
    private readonly onboardingService: OnboardingService,
    private readonly confirmAlert: ConfirmAlert,
    private readonly translocoService: TranslocoService
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
    } catch {
      this.dialogRef.close();
      await this.confirmAlert.present({
        header: this.translocoService.translate('.error'),
        message: this.translocoService.translate('error.prefetchError'),
      });
    } finally {
      this.dialogRef.close();
    }
  }
}
