import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { groupBy } from 'lodash';
import { combineLatest, defer, forkJoin, interval, of, zip } from 'rxjs';
import {
  concatMap,
  concatMapTo,
  distinctUntilChanged,
  first,
  map,
  pluck,
} from 'rxjs/operators';
import { CollectorService } from '../../services/collector/collector.service';
import { DiaBackendAssetRepository } from '../../services/dia-backend/asset/dia-backend-asset-repository.service';
import { DiaBackendAuthService } from '../../services/dia-backend/auth/dia-backend-auth.service';
import { DiaBackendTransactionRepository } from '../../services/dia-backend/transaction/dia-backend-transaction-repository.service';
import { IgnoredTransactionRepository } from '../../services/dia-backend/transaction/ignored-transaction-repository.service';
import { PushNotificationService } from '../../services/push-notification/push-notification.service';
import { getOldProof } from '../../services/repositories/proof/old-proof-adapter';
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
        assets.map(asset => ({
          asset,
          // tslint:disable-next-line: no-non-null-assertion
          proofWithThumbnail: proofsWithThumbnail.find(
            p => getOldProof(p.proof).hash === asset.proof_hash
          )!,
        }))
      ),
      // WORKAROUND: Use the lax comparison for now. We will redefine the flow
      // to save and show Proofs first, and then publish to DIA backend. See
      // #212:
      // https://github.com/numbersprotocol/capture-lite/issues/212
      distinctUntilChanged(
        (captures1, captures2) => captures1.length === captures2.length
      )
    );
  }

  private getPostCaptures$() {
    return zip(
      this.diaBackendTransactionRepository.oldFetchAll$().pipe(first()),
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
      concatMapTo(
        this.diaBackendTransactionRepository.oldFetchAll$().pipe(first())
      ),
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
