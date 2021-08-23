import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AlertController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DiaBackendAssetPrefetchingService } from '../../../../shared/dia-backend/asset/prefetching/dia-backend-asset-prefetching.service';
import { MigrationService } from '../../../../shared/migration/service/migration.service';
import { OnboardingService } from '../../../../shared/onboarding/onboarding.service';

@UntilDestroy()
@Component({
  selector: 'app-prefetching-dialog',
  templateUrl: './prefetching-dialog.component.html',
  styleUrls: ['./prefetching-dialog.component.scss'],
})
export class PrefetchingDialogComponent {
  progress = 0;

  constructor(
    private readonly alertController: AlertController,
    private readonly dialogRef: MatDialogRef<PrefetchingDialogComponent>,
    private readonly diaBackendAssetPrefetchingService: DiaBackendAssetPrefetchingService,
    private readonly migrationService: MigrationService,
    private readonly onboardingService: OnboardingService,
    private readonly translocoService: TranslocoService
  ) {
    this.prefetch().finally(() => {
      this.migrationService
        .generateAndUpdateSignatureForUnversionedProofs$()
        .pipe(untilDestroyed(this))
        .subscribe();
    });
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
      const alert = await this.alertController.create({
        header: this.translocoService.translate(
          'error.prefetch.connectErrorTitle'
        ),
        message: this.translocoService.translate('error.prefetch.connectError'),
        buttons: [{ text: this.translocoService.translate('ok') }],
        mode: 'md',
      });
      await alert.present();
    } finally {
      this.dialogRef.close();
    }
  }
}
