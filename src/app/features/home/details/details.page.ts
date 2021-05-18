import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, defer, iif, Observable, of, ReplaySubject } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  first,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';
import SwiperCore, { Swiper, Virtual } from 'swiper/core';
import {
  DiaBackendAsset,
  DiaBackendAssetRepository,
} from '../../../shared/dia-backend/asset/dia-backend-asset-repository.service';
import { DiaBackendAuthService } from '../../../shared/dia-backend/auth/dia-backend-auth.service';
import { ErrorService } from '../../../shared/error/error.service';
import { MediaStore } from '../../../shared/media/media-store/media-store.service';
import {
  getOldProof,
  OldDefaultInformationName,
} from '../../../shared/repositories/proof/old-proof-adapter';
import { Proof } from '../../../shared/repositories/proof/proof';
import { ProofRepository } from '../../../shared/repositories/proof/proof-repository.service';
import { blobToBase64 } from '../../../utils/encoding/encoding';
import { isNonNullable } from '../../../utils/rx-operators/rx-operators';

SwiperCore.use([Virtual]);

@UntilDestroy()
@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage {
  private readonly type$ = this.route.paramMap.pipe(
    map(params => params.get('type')),
    isNonNullable()
  );

  readonly detailedCaptures$: Observable<DetailedCapture[]> = this.type$.pipe(
    switchMap(type => iif(() => type === 'capture', this.fromCaptures$))
  );

  private readonly fromCaptures$ = this.proofRepository.all$.pipe(
    map(proofs =>
      proofs
        .sort((a, b) => b.timestamp - a.timestamp)
        .map(
          p =>
            new DetailedCapture(
              p,
              this.mediaStore,
              this.diaBackendAssetRepository,
              this.errorService,
              this.diaBackendAuthService,
              this.translocoService
            )
        )
    )
  );

  private readonly initialId$ = this.route.paramMap.pipe(
    map(params => params.get('id')),
    isNonNullable()
  );

  readonly initialSlideIndex$ = combineLatest([
    this.initialId$,
    this.detailedCaptures$,
  ]).pipe(
    first(),
    map(([initialId, detailedCaptures]) =>
      detailedCaptures.findIndex(c => c.id === initialId)
    )
  );

  private readonly initializeActiveDetailedCapture$ = combineLatest([
    this.initialId$,
    this.detailedCaptures$,
  ]).pipe(
    first(),
    map(([initialId, detailedCaptures]) =>
      detailedCaptures.find(c => c.id === initialId)
    ),
    isNonNullable(),
    tap(initialDetailedCapture =>
      this._activeDetailedCapture$.next(initialDetailedCapture)
    )
  );

  private readonly swiper$ = new ReplaySubject<Swiper>(1);

  private readonly _activeDetailedCapture$ = new ReplaySubject<DetailedCapture>(
    1
  );

  readonly activeDetailedCapture$ = this._activeDetailedCapture$.pipe(
    distinctUntilChanged()
  );

  constructor(
    private readonly navController: NavController,
    private readonly proofRepository: ProofRepository,
    private readonly mediaStore: MediaStore,
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository,
    private readonly errorService: ErrorService,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly translocoService: TranslocoService,
    private readonly route: ActivatedRoute
  ) {
    this.initializeActiveDetailedCapture$
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  navigateBack() {
    return this.navController.back();
  }

  // eslint-disable-next-line class-methods-use-this
  trackDetailedCapture(_: number, item: DetailedCapture) {
    return item.id;
  }

  onSwiperCreated(swiper: Swiper) {
    this.swiper$.next(swiper);
  }

  onSlidesChanged() {
    return combineLatest([this.swiper$, this.detailedCaptures$])
      .pipe(
        first(),
        tap(([swiper, detailedCaptures]) =>
          this._activeDetailedCapture$.next(
            detailedCaptures[swiper.activeIndex]
          )
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }
}

class DetailedCapture {
  get id() {
    if (this.proofOrDiaBackendAsset instanceof Proof)
      return getOldProof(this.proofOrDiaBackendAsset).hash;
    return this.proofOrDiaBackendAsset.id;
  }

  readonly mediaUrl$ = defer(async () => {
    if (this.proofOrDiaBackendAsset instanceof Proof) {
      const proof = this.proofOrDiaBackendAsset;
      const [index, meta] = Object.entries(proof.indexedAssets)[0];
      if (!(await this.mediaStore.exists(index)) && proof.diaBackendAssetId) {
        const mediaBlob = await this.diaBackendAssetRepository
          .downloadFile$({ id: proof.diaBackendAssetId, field: 'asset_file' })
          .pipe(
            first(),
            catchError((err: unknown) => this.errorService.toastError$(err))
          )
          .toPromise();
        await proof.setAssets({ [await blobToBase64(mediaBlob)]: meta });
      }
      return proof.getFirstAssetUrl();
    }

    return this.proofOrDiaBackendAsset.asset_file;
  });

  readonly mediaMimeType$ = defer(async () => {
    if (this.proofOrDiaBackendAsset instanceof Proof)
      return (await this.proofOrDiaBackendAsset.getFirstAssetMeta()).mimeType;
    return this.proofOrDiaBackendAsset.asset_file_mime_type;
  });

  readonly creator$ = defer(() => {
    if (this.proofOrDiaBackendAsset instanceof Proof)
      return this.diaBackendAuthService.username$;
    return of(this.proofOrDiaBackendAsset.creator_name);
  });

  readonly location$ = defer(async () => {
    const fixedLength = 6;
    let geolocation: { latitude: number; longitude: number } | undefined;
    if (this.proofOrDiaBackendAsset instanceof Proof) {
      geolocation = normalizeGeolocation({
        latitude: this.proofOrDiaBackendAsset.geolocationLatitude,
        longitude: this.proofOrDiaBackendAsset.geolocationLongitude,
      });
    } else {
      geolocation = getGeolocation(this.proofOrDiaBackendAsset);
    }
    if (geolocation)
      return `${geolocation.latitude.toFixed(
        fixedLength
      )}, ${geolocation.longitude.toFixed(fixedLength)}`;
    return this.translocoService.translate<string>('locationNotProvided');
  });

  readonly timestamp$ = defer(async () => {
    if (this.proofOrDiaBackendAsset instanceof Proof)
      return this.proofOrDiaBackendAsset.timestamp;
    return this.proofOrDiaBackendAsset.information.proof?.timestamp;
  });

  readonly mediaId$ = defer(async () => {
    if (this.proofOrDiaBackendAsset instanceof Proof)
      return this.proofOrDiaBackendAsset.diaBackendAssetId;
    return this.proofOrDiaBackendAsset.id;
  });

  constructor(
    private readonly proofOrDiaBackendAsset: Proof | DiaBackendAsset,
    private readonly mediaStore: MediaStore,
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository,
    private readonly errorService: ErrorService,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly translocoService: TranslocoService
  ) {}
}

function getGeolocation(diaBackendAsset: DiaBackendAsset) {
  const latitude = diaBackendAsset.information.information?.find(
    info => info.name === OldDefaultInformationName.GEOLOCATION_LATITUDE
  )?.value;
  const longitude = diaBackendAsset.information.information?.find(
    info => info.name === OldDefaultInformationName.GEOLOCATION_LONGITUDE
  )?.value;
  return normalizeGeolocation({ latitude, longitude });
}

function normalizeGeolocation({
  latitude,
  longitude,
}: {
  latitude: any;
  longitude: any;
}) {
  if (
    ((typeof latitude === 'string' &&
      latitude !== 'undefined' &&
      latitude !== '') ||
      typeof latitude === 'number') &&
    ((typeof longitude === 'string' &&
      longitude !== 'undefined' &&
      longitude !== '') ||
      typeof longitude === 'number')
  )
    return { latitude: Number(latitude), longitude: Number(longitude) };
  return undefined;
}
