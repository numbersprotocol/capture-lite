import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import mergeImages from 'merge-images';
import { BehaviorSubject } from 'rxjs';
import { concatMap, first, map } from 'rxjs/operators';
import {
  DiaBackendAsset,
  DiaBackendAssetRepository,
} from '../../services/dia-backend/asset/dia-backend-asset-repository.service';
import { DiaBackendTransaction } from '../../services/dia-backend/transaction/dia-backend-transaction-repository.service';
import { ImageStore } from '../../services/image-store/image-store.service';
import { getOldProof } from '../../services/repositories/proof/old-proof-adapter';
import { ProofRepository } from '../../services/repositories/proof/proof-repository.service';
import { isNonNullable } from '../../utils/rx-operators/rx-operators';

const { Share, Browser } = Plugins;

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-post-capture-card',
  templateUrl: './post-capture-card.component.html',
  styleUrls: ['./post-capture-card.component.scss'],
})
export class PostCaptureCardComponent implements OnInit {
  @Input() readonly sharable = true;
  @Input() private readonly transaction!: DiaBackendTransaction;
  @ViewChild('ratioImg', { static: true }) ratioImg!: ElementRef;

  private readonly _transaction$ = new BehaviorSubject(this.transaction);
  readonly transaction$ = this._transaction$
    .asObservable()
    .pipe(isNonNullable());
  readonly asset$ = this.transaction$.pipe(
    concatMap(transaction =>
      this.diaBackendAssetRepository.getById$(transaction.asset.id)
    ),
    isNonNullable()
  );
  readonly proof$ = this.asset$.pipe(
    concatMap(asset => this.getProofByAsset$(asset)),
    isNonNullable()
  );
  readonly rawDataUrl$ = this.proof$.pipe(
    concatMap(proof => proof.getAssets()),
    map(assets => {
      const [base64, meta] = Object.entries(assets)[0];
      return `data:${meta.mimeType};base64,${base64}`;
    })
  );
  readonly location$ = this.proof$.pipe(
    map(proof => {
      const latitude = proof.geolocationLatitude;
      const longitude = proof.geolocationLongitude;
      return latitude && longitude
        ? `${latitude}, ${longitude}`
        : this.translocoService.translate('locationNotProvided');
    })
  );
  openMore = false;

  constructor(
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository,
    private readonly proofRepository: ProofRepository,
    private readonly translocoService: TranslocoService,
    private readonly imageStore: ImageStore,
    private readonly httpClient: HttpClient
  ) {}

  ngOnInit() {
    this._transaction$.next(this.transaction);
  }

  private getProofByAsset$(asset: DiaBackendAsset) {
    return this.proofRepository
      .getAll$()
      .pipe(
        map(proofs =>
          proofs.find(proof => getOldProof(proof).hash === asset.proof_hash)
        )
      );
  }

  share() {
    return this.asset$
      .pipe(
        first(),
        concatMap(asset =>
          mergeImages(
            [asset.sharable_copy, 'assets/image/new-year-frame.png'],
            // @ts-ignore
            { format: 'image/jpeg', crossOrigin: 'Anonymous' }
          )
        ),
        concatMap(async watermarkedUrl => {
          const base64 = watermarkedUrl.split(',')[1];
          return this.imageStore.write(base64, 'image/jpeg');
        }),
        concatMap(index => this.imageStore.getUri(index)),
        concatMap(watermarkedUri =>
          Share.share({
            text: '#CaptureApp #OnlyTruePhotos',
            url: watermarkedUri,
          })
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }
}
