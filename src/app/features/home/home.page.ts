import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy } from '@ngneat/until-destroy';
import { combineLatest } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CollectorService } from '../../shared/services/collector/collector.service';
import { DiaBackendAuthService } from '../../shared/services/dia-backend/auth/dia-backend-auth.service';
import { DiaBackendTransactionRepository } from '../../shared/services/dia-backend/transaction/dia-backend-transaction-repository.service';
import { ImageStore } from '../../shared/services/image-store/image-store.service';
import { OnboardingService } from '../../shared/services/onboarding/onboarding.service';
import { getOldProof } from '../../shared/services/repositories/proof/old-proof-adapter';
import { Proof } from '../../shared/services/repositories/proof/proof';
import { ProofRepository } from '../../shared/services/repositories/proof/proof-repository.service';
import { capture } from '../../utils/camera';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
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
  readonly username$ = this.diaBackendAuthService.getUsername$();
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
    private readonly proofRepository: ProofRepository,
    private readonly imageStore: ImageStore,
    private readonly collectorService: CollectorService
  ) {}

  async ngOnInit() {
    if (await this.onboardingService.isOnboarding()) {
      this.router.navigate(['/tutorial']);
    }
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
    const photo = await capture();
    const proof = await Proof.from(
      this.imageStore,
      { [photo.base64]: { mimeType: photo.mimeType } },
      { timestamp: Date.now(), providers: {} },
      {}
    );
    await this.proofRepository.add(proof);

    const collected = await this.collectorService.run(await proof.getAssets());
    return this.proofRepository.update(
      collected,
      (x, y) => getOldProof(x).hash === getOldProof(y).hash
    );
  }
}
