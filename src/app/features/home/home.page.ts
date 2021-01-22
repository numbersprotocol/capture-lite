import { ChangeDetectorRef, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy } from '@ngneat/until-destroy';
import { map, tap } from 'rxjs/operators';
import { CaptureService } from '../../shared/services/capture/capture.service';
import { ConfirmAlert } from '../../shared/services/confirm-alert/confirm-alert.service';
import { DiaBackendAuthService } from '../../shared/services/dia-backend/auth/dia-backend-auth.service';
import { DiaBackendTransactionRepository } from '../../shared/services/dia-backend/transaction/dia-backend-transaction-repository.service';
import { OnboardingService } from '../../shared/services/onboarding/onboarding.service';
import { PrefetchingDialogComponent } from './onboarding/prefetching-dialog/prefetching-dialog.component';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  readonly username$ = this.diaBackendAuthService.getUsername$;
  readonly inboxCount$ = this.diaBackendTransactionRepository.getInbox$().pipe(
    map(transactions => transactions.length),
    // WORKARDOUND: force changeDetection to update badge when returning to App by clicking push notification
    tap(() => this.changeDetectorRef.detectChanges())
  );
  postCaptureTabFocus = false;

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly diaBackendTransactionRepository: DiaBackendTransactionRepository,
    private readonly onboardingService: OnboardingService,
    private readonly router: Router,
    private readonly captureService: CaptureService,
    private readonly route: ActivatedRoute,
    private readonly confirmAlert: ConfirmAlert,
    private readonly dialog: MatDialog,
    private readonly translocoService: TranslocoService
  ) {}

  async ionViewDidEnter() {
    if (!(await this.onboardingService.hasShownTutorial())) {
      return this.router.navigate(['onboarding/tutorial'], {
        relativeTo: this.route,
      });
    }
    if (!(await this.onboardingService.hasPrefetchedDiaBackendAssets())) {
      if (await this.showPrefetchAlert()) {
        return this.dialog.open(PrefetchingDialogComponent, {
          disableClose: true,
        });
      }
      return this.onboardingService.setHasPrefetchedDiaBackendAssets(true);
    }
  }

  private async showPrefetchAlert() {
    return this.confirmAlert.present({
      header: this.translocoService.translate('restorePhotos'),
      message: this.translocoService.translate('message.confirmPrefetch'),
      confirmButtonText: this.translocoService.translate('restore'),
      cancelButtonText: this.translocoService.translate('skip'),
    });
  }

  async capture() {
    return this.captureService.capture();
  }

  onTapChanged(event: MatTabChangeEvent) {
    this.postCaptureTabFocus = event.index === 1;
  }
}
