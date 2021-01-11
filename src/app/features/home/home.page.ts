import { formatDate, KeyValue } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { groupBy, isEqual, sortBy, without } from 'lodash';
import { BehaviorSubject, combineLatest, defer } from 'rxjs';
import {
  concatMap,
  concatMapTo,
  distinctUntilChanged,
  finalize,
  first,
  map,
  tap,
} from 'rxjs/operators';
import { CollectorService } from '../../shared/services/collector/collector.service';
import {
  DiaBackendAsset,
  DiaBackendAssetRepository,
} from '../../shared/services/dia-backend/asset/dia-backend-asset-repository.service';
import { DiaBackendAuthService } from '../../shared/services/dia-backend/auth/dia-backend-auth.service';
import { DiaBackendTransactionRepository } from '../../shared/services/dia-backend/transaction/dia-backend-transaction-repository.service';
import { OnboardingService } from '../../shared/services/onboarding/onboarding.service';
import { getOldProof } from '../../shared/services/repositories/proof/old-proof-adapter';
import { Proof } from '../../shared/services/repositories/proof/proof';
import { ProofRepository } from '../../shared/services/repositories/proof/proof-repository.service';
import { capture } from '../../utils/camera';
import { toDataUrl } from '../../utils/url';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  private readonly collectingCaptures$ = new BehaviorSubject<CaptureItem[]>([]);
  readonly capturesByDate$ = this.getCaptures$().pipe(
    map(captures => sortBy(captures, c => -c.item.timestamp)),
    map(captures =>
      groupBy(captures, c =>
        formatDate(c.item.timestamp, 'yyyy/MM/dd', 'en-US')
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
    private readonly translocoService: TranslocoService,
    private readonly onboardingService: OnboardingService,
    private readonly router: Router
  ) {}

  async ngOnInit() {
    if (await this.onboardingService.isOnboarding()) {
      this.router.navigate(['/tutorial']);
    }
  }

  // tslint:disable-next-line: prefer-function-over-method
  keyDescendingOrder(
    a: KeyValue<number, string>,
    b: KeyValue<number, string>
  ): number {
    return a.key > b.key ? -1 : b.key > a.key ? 1 : 0;
  }

  // tslint:disable-next-line: prefer-function-over-method
  trackCaptureItem(_: number, item: CaptureItem) {
    return item.id ?? item.oldProofHash;
  }

  private getCaptures$() {
    return combineLatest([
      this.diaBackendAssetRepository.getAll$(),
      this.proofRepository.getAll$(),
      this.collectingCaptures$.asObservable(),
    ]).pipe(
      map(([assets, proofs, collectingCaptures]) =>
        mergeDiaBackendAssetsAndProofs(assets, proofs).concat(
          collectingCaptures
        )
      ),
      map(captures =>
        captures.filter(
          c => !c.diaBackendAsset || c.diaBackendAsset.is_original_owner
        )
      ),
      concatMap(captures =>
        Promise.all(
          captures.map(async c => ({
            item: c,
            thumbnailUrl: await c.getThumbnailUrl(),
          }))
        )
      ),
      distinctUntilChanged((x, y) =>
        isEqual(
          x.map(cx => ({ hash: cx.item.oldProofHash, asset: cx.item?.id })),
          y.map(cy => ({ hash: cy.item.oldProofHash, asset: cy.item?.id }))
        )
      )
    );
  }

  capture() {
    return defer(capture)
      .pipe(
        concatMap(async photo => {
          const collectingCapture = new CaptureItem({
            rawUrl: toDataUrl(photo.base64, photo.mimeType),
          });
          this.collectingCaptures$.next(
            this.collectingCaptures$.value.concat(collectingCapture)
          );

          const proof = await this.collectorService.runAndStore({
            [photo.base64]: { mimeType: photo.mimeType },
          });

          this.collectingCaptures$.next(
            without(this.collectingCaptures$.value, collectingCapture)
          );
          return proof;
        }),
        concatMap(proof => this.diaBackendAssetRepository.add(proof)),
        first(),
        concatMapTo(this.diaBackendAssetRepository.refresh$()),
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
    return defer(() => this.diaBackendAssetRepository.add(proof))
      .pipe(
        concatMapTo(this.diaBackendAssetRepository.refresh$()),
        untilDestroyed(this),
        finalize(() => (this.currentUploadingProofHash = ''))
      )
      .subscribe();
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

function mergeDiaBackendAssetsAndProofs(
  diaBackendAssets: DiaBackendAsset[],
  proofs: Proof[]
) {
  let unpublishedProofs = proofs;
  const items: CaptureItem[] = [];

  for (const diaBackendAsset of diaBackendAssets) {
    const found = proofs.find(
      proof => getOldProof(proof).hash === diaBackendAsset.proof_hash
    );
    unpublishedProofs = unpublishedProofs.filter(
      proof => !isEqual(proof, found)
    );
    items.push(new CaptureItem({ diaBackendAsset, proof: found }));
  }

  for (const unpublished of unpublishedProofs) {
    items.push(new CaptureItem({ proof: unpublished }));
  }

  return items;
}

// Uniform interface for Proof, Asset and DiaBackendAsset
class CaptureItem {
  rawUrl?: string;
  proof?: Proof;
  diaBackendAsset?: DiaBackendAsset;

  get id() {
    return this.diaBackendAsset?.id;
  }

  get oldProofHash() {
    if (this.diaBackendAsset) {
      return this.diaBackendAsset.proof_hash;
    }
    if (this.proof) {
      return getOldProof(this.proof).hash;
    }
    return undefined;
  }

  get timestamp() {
    if (this.diaBackendAsset?.information.proof) {
      return this.diaBackendAsset.information.proof.timestamp;
    }
    if (this.proof) {
      return this.proof.timestamp;
    }
    return this.createdTimestamp;
  }

  private readonly createdTimestamp: number;

  constructor({
    rawUrl,
    proof,
    diaBackendAsset,
  }: {
    rawUrl?: string;
    proof?: Proof;
    diaBackendAsset?: DiaBackendAsset;
  }) {
    this.rawUrl = rawUrl;
    this.proof = proof;
    this.diaBackendAsset = diaBackendAsset;
    this.createdTimestamp = Date.now();
  }

  async getThumbnailUrl() {
    if (this.diaBackendAsset) {
      return this.diaBackendAsset.asset_file_thumbnail;
    }
    if (this.proof) {
      return this.proof.getThumbnailUrl();
    }
    if (this.rawUrl) {
      return this.rawUrl;
    }
  }
}
