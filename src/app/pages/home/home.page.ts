import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { groupBy } from 'lodash';
import { combineLatest, defer, forkJoin, interval, of, zip } from 'rxjs';
import { concatMap, concatMapTo, first, map, pluck } from 'rxjs/operators';
import { CollectorService } from '../../services/collector/collector.service';
import { DiaBackendAssetRepository } from '../../services/dia-backend/asset/dia-backend-asset-repository.service';
import { DiaBackendAuthService } from '../../services/dia-backend/auth/dia-backend-auth.service';
import { DiaBackendTransactionRepository } from '../../services/dia-backend/transaction/dia-backend-transaction-repository.service';
import { IgnoredTransactionRepository } from '../../services/dia-backend/transaction/ignored-transaction-repository.service';
import { PushNotificationService } from '../../services/push-notification/push-notification.service';
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
export class HomePage implements OnInit {
  readonly capturesByDate$ = this.getCaptures$().pipe(
    map(captures =>
      groupBy(captures, c =>
        formatDate(
          c.proofWithThumbnail?.proof.truth.timestamp,
          'mediumDate',
          'en-US'
        )
      )
    )
  );
  postCaptures$ = this.getPostCaptures$();
  readonly username$ = this.diaBackendAuthService.getUsername$();
  captureButtonShow = true;
  inboxCount$ = this.pollingInbox$().pipe(
    map(transactions => transactions.length)
  );
  currentUploadingProofHash = '';

  constructor(
    private readonly proofRepository: ProofRepository,
    private readonly collectorService: CollectorService,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository,
    private readonly diaBackendTransactionRepository: DiaBackendTransactionRepository,
    private readonly pushNotificationService: PushNotificationService,
    private readonly ignoredTransactionRepository: IgnoredTransactionRepository
  ) {}

  ngOnInit() {
    this.pushNotificationService.configure();
  }

  private getCaptures$() {
    const originallyOwnedAssets$ = this.diaBackendAssetRepository
      .getAll$()
      .pipe(map(assets => assets.filter(asset => asset.is_original_owner)));

    const proofsWithThumbnail$ = this.proofRepository.getAll$().pipe(
      map(proofs =>
        proofs.map(proof => ({
          proof,
          thumbnailBase64$: defer(() => proof.getThumbnailBase64()),
        }))
      )
    );

    return combineLatest([originallyOwnedAssets$, proofsWithThumbnail$]).pipe(
      map(([assets, proofsWithThumbnail]) =>
        proofsWithThumbnail.map(proofWithThumbnail => ({
          hash: getOldProof(proofWithThumbnail.proof).hash,
          proofWithThumbnail,
          asset: assets.find(
            a => getOldProof(proofWithThumbnail.proof).hash === a.proof_hash
          ),
        }))
      )
    );
  }

  private getPostCaptures$() {
    return zip(
      this.diaBackendTransactionRepository.getAll$(),
      this.diaBackendAuthService.getEmail()
    ).pipe(
      map(([transactionListResponse, email]) =>
        transactionListResponse.results.filter(
          transaction =>
            transaction.sender !== email &&
            !transaction.expired &&
            transaction.fulfilled_at
        )
      ),
      concatMap(transactions =>
        zip(
          of(transactions),
          forkJoin(
            transactions.map(transaction =>
              this.diaBackendAssetRepository.getById$(transaction.asset.id)
            )
          )
        )
      ),
      map(([transactions, assets]) =>
        transactions.map((transaction, index) => ({
          transaction,
          asset: assets[index],
        }))
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
      this.postCaptures$ = this.getPostCaptures$();
    }
  }

  /**
   * TODO: Use repository pattern to cache the inbox data.
   */
  private pollingInbox$() {
    // tslint:disable-next-line: no-magic-numbers
    return interval(10000).pipe(
      concatMapTo(this.diaBackendTransactionRepository.getAll$()),
      pluck('results'),
      concatMap(postCaptures =>
        zip(of(postCaptures), this.diaBackendAuthService.getEmail())
      ),
      map(([postCaptures, email]) =>
        postCaptures.filter(
          postCapture =>
            postCapture.receiver_email === email &&
            !postCapture.fulfilled_at &&
            !postCapture.expired
        )
      ),
      concatMap(postCaptures =>
        zip(of(postCaptures), this.ignoredTransactionRepository.getAll$())
      ),
      map(([postCaptures, ignoredTransactions]) =>
        postCaptures.filter(
          postcapture => !ignoredTransactions.includes(postcapture.id)
        )
      )
    );
  }
}
