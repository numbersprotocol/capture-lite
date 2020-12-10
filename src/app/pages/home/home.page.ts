import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { groupBy } from 'lodash';
import { combineLatest, defer, forkJoin, of, zip } from 'rxjs';
import { concatMap, first, map } from 'rxjs/operators';
import { CollectorService } from '../../services/collector/collector.service';
import { OnConflictStrategy } from '../../services/database/table/table';
import { DiaBackendAssetRepository } from '../../services/dia-backend/asset/dia-backend-asset-repository.service';
import { DiaBackendAuthService } from '../../services/dia-backend/auth/dia-backend-auth.service';
import { DiaBackendTransactionRepository } from '../../services/dia-backend/transaction/dia-backend-transaction-repository.service';
import { ImageStore } from '../../services/image-store/image-store.service';
import {
  getOldProof,
  getProof,
} from '../../services/repositories/proof/old-proof-adapter';
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
  inboxCount$ = this.diaBackendTransactionRepository
    .getInbox$()
    .pipe(map(transactions => transactions.length));
  currentUploadingProofHash = '';
  private readonly workaroundFetchLimit = 10;
  private postCaptureLimitationMessageShowed = false;

  constructor(
    private readonly proofRepository: ProofRepository,
    private readonly collectorService: CollectorService,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository,
    private readonly diaBackendTransactionRepository: DiaBackendTransactionRepository,
    private readonly imageStore: ImageStore,
    private readonly httpClient: HttpClient,
    private readonly snackbar: MatSnackBar,
    private readonly translocoService: TranslocoService
  ) {}

  ngOnInit() {
    /**
     * TODO: Remove this ugly WORKAROUND by using repository pattern to cache the expired assets and proofs.
     * TODO: Move this functionality to DiaBackendAssetRepository.initialize$() method.
     */
    this.diaBackendTransactionRepository
      .getAll$()
      .pipe(
        concatMap(transactions =>
          forkJoin([
            of(transactions),
            defer(() => this.diaBackendAuthService.getEmail()),
          ])
        ),
        map(([transactions, email]) =>
          transactions.filter(t => t.expired && t.sender === email)
        ),
        concatMap(expiredTransactions =>
          forkJoin(
            expiredTransactions.map(t =>
              this.diaBackendAssetRepository.getById$(t.asset.id)
            )
          )
        ),
        concatMap(expiredAssets =>
          forkJoin([
            of(expiredAssets),
            defer(() =>
              Promise.all(
                expiredAssets.map(async a => {
                  return this.proofRepository.add(
                    await getProof(
                      this.imageStore,
                      await this.httpClient
                        .get(a.asset_file, { responseType: 'blob' })
                        .toPromise(),
                      a.information,
                      a.signature
                    ),
                    OnConflictStrategy.REPLACE
                  );
                })
              )
            ),
          ])
        ),
        concatMap(([expiredAssets]) =>
          this.diaBackendAssetRepository.addAssetDirectly(
            expiredAssets,
            OnConflictStrategy.REPLACE
          )
        ),
        untilDestroyed(this)
      )
      .subscribe();
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

  // TODO: Clean up this ugly WORKAROUND with repository pattern.
  private getPostCaptures$() {
    return zip(
      this.diaBackendTransactionRepository.getAll$().pipe(first()),
      this.diaBackendAuthService.getEmail()
    ).pipe(
      map(([transactions, email]) =>
        transactions.filter(
          transaction =>
            transaction.sender !== email &&
            !transaction.expired &&
            transaction.fulfilled_at
        )
      ),
      // WORKAROUND: for PostCapture not displaying when exceeding a certain limit. (#291)
      map(transactions => transactions.slice(0, this.workaroundFetchLimit)),
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
