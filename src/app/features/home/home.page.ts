import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest } from 'rxjs';
import { concatMap, map, tap } from 'rxjs/operators';
import { DiaBackendAuthService } from '../../shared/services/dia-backend/auth/dia-backend-auth.service';
import { DiaBackendTransactionRepository } from '../../shared/services/dia-backend/transaction/dia-backend-transaction-repository.service';
import { ImageStore } from '../../shared/services/image-store/image-store.service';
import { OnboardingService } from '../../shared/services/onboarding/onboarding.service';
import { Proof } from '../../shared/services/repositories/proof/proof';
import { ProofRepository } from '../../shared/services/repositories/proof/proof-repository.service';
import { capture } from '../../utils/camera';
import { blobToBase64 } from '../../utils/encoding/encoding';

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
    private readonly httpClient: HttpClient
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
    return this.proofRepository.add(proof);
  }

  captureTest() {
    for (let index = 1; index <= 20; index += 1) {
      this.httpClient
        .get(`/assets/test/${index}.jpg`, { responseType: 'blob' })
        .pipe(
          concatMap(blobToBase64),
          concatMap(base64 =>
            Proof.from(
              this.imageStore,
              { [base64]: { mimeType: 'image/jpeg' } },
              {
                timestamp: randomDate(
                  new Date(2020, 1, 1),
                  new Date(2020, 1, 5)
                ).getTime(),
                providers: {},
              },
              {}
            )
          ),
          concatMap(proof => this.proofRepository.add(proof)),
          untilDestroyed(this)
        )
        .subscribe();
    }
  }
}

function randomDate(start: Date, end: Date) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}
