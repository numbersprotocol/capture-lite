import { ChangeDetectorRef, Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy } from '@ngneat/until-destroy';
import { combineLatest } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CaptureService } from '../../shared/services/capture/capture.service';
import { ConfirmAlert } from '../../shared/services/confirm-alert/confirm-alert.service';
import { DiaBackendAuthService } from '../../shared/services/dia-backend/auth/dia-backend-auth.service';
import { DiaBackendTransactionRepository } from '../../shared/services/dia-backend/transaction/dia-backend-transaction-repository.service';
import { OnboardingService } from '../../shared/services/onboarding/onboarding.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  readonly postCaptures$ = combineLatest([
    this.diaBackendTransactionRepository.getAll$(),
    this.diaBackendAuthService.getEmail(),
  ]).pipe(
    map(([transactions, email]) =>
      transactions
        .filter(
          transaction =>
            transaction.sender !== email &&
            !transaction.expired &&
            transaction.fulfilled_at
        )
        // WORKAROUND: for PostCapture not displaying when exceeding a certain limit. (#291)
        .slice(0, this.workaroundFetchLimit)
    )
  );
  readonly username$ = this.diaBackendAuthService.getUsername$;
  readonly inboxCount$ = this.diaBackendTransactionRepository.getInbox$().pipe(
    map(transactions => transactions.length),
    // WORKARDOUND: force changeDetection to update badge when returning to App by clicking push notification
    tap(() => this.changeDetectorRef.detectChanges())
  );
  private readonly workaroundFetchLimit = 10;
  private postCaptureLimitationMessageShowed = false;

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly diaBackendTransactionRepository: DiaBackendTransactionRepository,
    private readonly snackbar: MatSnackBar,
    private readonly translocoService: TranslocoService,
    private readonly onboardingService: OnboardingService,
    private readonly router: Router,
    private readonly captureService: CaptureService,
    private readonly route: ActivatedRoute,
    private readonly confirmAlert: ConfirmAlert
  ) {}

  async ionViewDidEnter() {
    if (!(await this.onboardingService.hasShownTutorial())) {
      return this.router.navigate(['onboarding/tutorial'], {
        relativeTo: this.route,
      });
    }
    if (!(await this.onboardingService.hasPrefetchedDiaBackendAssets())) {
      if (await this.showPrefetchAlert()) {
        return this.router.navigate(['onboarding/prefetching'], {
          relativeTo: this.route,
          replaceUrl: true,
        });
      }
      return this.onboardingService.setHasPrefetchedDiaBackendAssets(true);
    }
  }

  private async showPrefetchAlert() {
    return this.confirmAlert.present({
      header: this.translocoService.translate('loadPreviousData'),
      message: this.translocoService.translate('message.confirmPrefetch'),
    });
  }

  onTapChanged(event: MatTabChangeEvent) {
    if (event.index === 1) {
      if (!this.postCaptureLimitationMessageShowed) {
        this.snackbar.open(
          this.translocoService.translate('message.postCaptureLimitation'),
          this.translocoService.translate('dismiss'),
          { duration: 8000 }
        );
        this.postCaptureLimitationMessageShowed = true;
      }
    }
  }

  async capture() {
    return this.captureService.capture();
  }
}
