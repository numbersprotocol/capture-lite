import { formatDate, KeyValue } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { groupBy, isEqual } from 'lodash';
import { combineLatest, defer } from 'rxjs';
import {
  concatMap,
  distinctUntilChanged,
  first,
  map,
  tap,
} from 'rxjs/operators';
import { CollectorService } from '../../services/collector/collector.service';
import { DiaBackendAssetRepository } from '../../services/dia-backend/asset/dia-backend-asset-repository.service';
import { DiaBackendAuthService } from '../../services/dia-backend/auth/dia-backend-auth.service';
import { DiaBackendTransactionRepository } from '../../services/dia-backend/transaction/dia-backend-transaction-repository.service';
import { getOldProof } from '../../services/repositories/proof/old-proof-adapter';
import { Proof } from '../../services/repositories/proof/proof';
import { ProofRepository } from '../../services/repositories/proof/proof-repository.service';
import { capture } from '../../utils/camera';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  readonly capturesByDate$ = this.getCaptures$().pipe(
    map(captures =>
      groupBy(captures, c =>
        formatDate(
          c.proofWithThumbnail?.proof.truth.timestamp,
          'yyyy/MM/dd',
          'en-US'
        )
      )
    )
  );
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
  captureButtonShow = true;
  currentUploadingProofHash = '';
  private readonly workaroundFetchLimit = 10;
  private postCaptureLimitationMessageShowed = false;

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly proofRepository: ProofRepository,
    private readonly collectorService: CollectorService,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository,
    private readonly diaBackendTransactionRepository: DiaBackendTransactionRepository,
    private readonly snackbar: MatSnackBar,
    private readonly translocoService: TranslocoService
  ) {}

  // tslint:disable-next-line: prefer-function-over-method
  keyDescendingOrder(
    a: KeyValue<number, string>,
    b: KeyValue<number, string>
  ): number {
    return a.key > b.key ? -1 : b.key > a.key ? 1 : 0;
  }

  private getCaptures$() {
    const proofsWithThumbnail$ = this.proofRepository.getAll$().pipe(
      map(proofs =>
        proofs.map(proof => ({
          proof,
          thumbnailBase64$: defer(() => proof.getThumbnailBase64()),
        }))
      )
    );

    return combineLatest([
      this.diaBackendAssetRepository.getAll$(),
      proofsWithThumbnail$,
    ]).pipe(
      map(([assets, proofsWithThumbnail]) =>
        proofsWithThumbnail.map(proofWithThumbnail => ({
          hash: getOldProof(proofWithThumbnail.proof).hash,
          proofWithThumbnail,
          asset: assets.find(
            a => getOldProof(proofWithThumbnail.proof).hash === a.proof_hash
          ),
        }))
      ),
      map(captures =>
        captures.filter(c => !c.asset || c.asset?.is_original_owner)
      ),
      distinctUntilChanged((x, y) =>
        isEqual(
          x.map(cx => ({ hash: cx.hash, asset: cx.asset?.id })),
          y.map(cy => ({ hash: cy.hash, asset: cy.asset?.id }))
        )
      )
    );
  }

  capture() {
    return defer(capture)
      .pipe(
        concatMap(photo =>
          this.collectorService.runAndStore({
            [photo.base64]: { mimeType: photo.mimeType },
          })
        ),
        concatMap(proof => this.diaBackendAssetRepository.add(proof)),
        first(),
        untilDestroyed(this)
      )
      .subscribe();
  }

  /**
   * WORKAROUND: use a single string currentUploadingProofHash to display uploading spinner for single Capture
   * The implementation has a limitation that only 1 Capture could be triggered to upload at a time.
   */
  async upload(proof: Proof) {
    if (this.currentUploadingProofHash) {
      return;
    }
    this.currentUploadingProofHash = getOldProof(proof).hash;
    return this.diaBackendAssetRepository
      .add(proof)
      .finally(() => (this.currentUploadingProofHash = ''));
  }

  onTapChanged(event: MatTabChangeEvent) {
    this.captureButtonShow = event.index === 0;
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
}
