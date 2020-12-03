import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { UntilDestroy } from '@ngneat/until-destroy';
import { groupBy } from 'lodash';
import { combineLatest, interval, of, zip } from 'rxjs';
import { concatMap, concatMapTo, map, pluck } from 'rxjs/operators';
import { CollectorService } from '../../services/collector/collector.service';
import { NumbersStorageApi } from '../../services/publisher/numbers-storage/numbers-storage-api.service';
import { AssetRepository } from '../../services/publisher/numbers-storage/repositories/asset/asset-repository.service';
import { IgnoredTransactionRepository } from '../../services/publisher/numbers-storage/repositories/ignored-transaction/ignored-transaction-repository.service';
import { PublishersAlert } from '../../services/publisher/publishers-alert/publishers-alert.service';
import { PushNotificationService } from '../../services/push-notification/push-notification.service';
import { getOldProof } from '../../services/repositories/proof/old-proof-adapter';
import { ProofRepository } from '../../services/repositories/proof/proof-repository.service';
import { capture } from '../../utils/camera';
import { forkJoinWithDefault } from '../../utils/rx-operators';

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
        formatDate(c.asset.uploaded_at, 'mediumDate', 'en-US')
      )
    )
  );
  postCaptures$ = this.getPostCaptures$();
  readonly username$ = this.numbersStorageApi.getUsername$();
  captureButtonShow = true;
  inboxCount$ = this.pollingInbox$().pipe(
    map(transactions => transactions.length)
  );

  constructor(
    private readonly assetRepository: AssetRepository,
    private readonly proofRepository: ProofRepository,
    private readonly collectorService: CollectorService,
    private readonly publishersAlert: PublishersAlert,
    private readonly numbersStorageApi: NumbersStorageApi,
    private readonly pushNotificationService: PushNotificationService,
    private readonly ignoredTransactionRepository: IgnoredTransactionRepository
  ) {}

  ngOnInit() {
    this.pushNotificationService.configure();
  }

  private getCaptures$() {
    const originallyOwnedAssets$ = this.assetRepository
      .getAll$()
      .pipe(map(assets => assets.filter(asset => asset.is_original_owner)));

    const proofsWithThumbnailAndOld$ = this.proofRepository.getAll$().pipe(
      concatMap(proofs =>
        Promise.all(
          proofs.map(async proof => ({
            proof,
            // FIXME: do not await async, use async pipe
            thumbnailDataUrl: `data:image/*;base64,${await proof.getThumbnailBase64()}`,
            oldProof: getOldProof(proof),
          }))
        )
      )
    );

    return combineLatest([
      originallyOwnedAssets$,
      proofsWithThumbnailAndOld$,
    ]).pipe(
      map(([assets, proofsWithThumbnailAndOld]) =>
        assets.map(asset => ({
          asset,
          proofWithThumbnailAndOld: proofsWithThumbnailAndOld.find(
            p => p.oldProof.hash === asset.proof_hash
          ),
        }))
      )
    );
  }

  private getPostCaptures$() {
    return zip(
      this.numbersStorageApi.listTransactions$(),
      this.numbersStorageApi.getEmail$()
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
          forkJoinWithDefault(
            transactions.map(transaction =>
              this.numbersStorageApi.readAsset$(transaction.asset.id)
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

  async capture() {
    const photo = await capture();
    const proof = await this.collectorService.runAndStore({
      [photo.base64]: { mimeType: photo.mimeType },
    });
    return this.publishersAlert.presentOrPublish(proof);
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
      concatMapTo(this.numbersStorageApi.listInbox$()),
      pluck('results'),
      concatMap(postCaptures =>
        zip(of(postCaptures), this.ignoredTransactionRepository.getAll$())
      ),
      map(([postCaptures, ignoredTransactions]) =>
        postCaptures.filter(
          postcapture =>
            !ignoredTransactions
              .map(transaction => transaction.id)
              .includes(postcapture.id)
        )
      )
    );
  }
}
