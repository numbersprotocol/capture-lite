import { Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { defer, of } from 'rxjs';
import { catchError, first, map, shareReplay, switchMap } from 'rxjs/operators';
import {
  DiaBackendAsset,
  DiaBackendAssetRepository,
} from '../../../../../shared/dia-backend/asset/dia-backend-asset-repository.service';
import { DiaBackendAuthService } from '../../../../../shared/dia-backend/auth/dia-backend-auth.service';
import { ErrorService } from '../../../../../shared/error/error.service';
import { MediaStore } from '../../../../../shared/media/media-store/media-store.service';
import {
  getOldProof,
  getSignatures,
  getTruth,
  OldDefaultInformationName,
} from '../../../../../shared/repositories/proof/old-proof-adapter';
import { Proof } from '../../../../../shared/repositories/proof/proof';
import { blobToBase64 } from '../../../../../utils/encoding/encoding';
import { isNonNullable } from '../../../../../utils/rx-operators/rx-operators';

@Injectable({
  providedIn: 'root',
})
export class InformationSessionService {
  activatedDetailedCapture: DetailedCapture | undefined;
}

export class DetailedCapture {
  readonly id =
    this.proofOrDiaBackendAsset instanceof Proof
      ? this.proofOrDiaBackendAsset.diaBackendAssetId
      : this.proofOrDiaBackendAsset.id;

  readonly hash =
    this.proofOrDiaBackendAsset instanceof Proof
      ? getOldProof(this.proofOrDiaBackendAsset).hash
      : this.proofOrDiaBackendAsset.proof_hash;

  readonly mediaUrl$ = defer(() => {
    if (this.proofOrDiaBackendAsset instanceof Proof) {
      const proof = this.proofOrDiaBackendAsset;
      return defer(async () => {
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
      });
    }

    return this.diaBackendAsset$.pipe(
      isNonNullable(),
      switchMap(asset =>
        this.diaBackendAssetRepository.getAndCachePostCaptureMedia$(asset)
      ),
      catchError((err: unknown) => this.errorService.toastError$(err)),
      first(),
      map(blob => URL.createObjectURL(blob)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
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

  readonly geolocation$ = defer(async () => {
    if (this.proofOrDiaBackendAsset instanceof Proof) {
      return normalizeGeolocation({
        latitude: this.proofOrDiaBackendAsset.geolocationLatitude,
        longitude: this.proofOrDiaBackendAsset.geolocationLongitude,
      });
    }
    return getGeolocation(this.proofOrDiaBackendAsset);
  });

  readonly locationDisplay$ = this.geolocation$.pipe(
    map(geolocation => {
      const fixedLength = 6;
      if (geolocation)
        return `${geolocation.latitude.toFixed(
          fixedLength
        )}, ${geolocation.longitude.toFixed(fixedLength)}`;
      return this.translocoService.translate<string>('notDisclosed');
    })
  );

  readonly timestamp$ = defer(async () => {
    if (this.proofOrDiaBackendAsset instanceof Proof)
      return this.proofOrDiaBackendAsset.timestamp;
    return this.proofOrDiaBackendAsset.information.proof?.timestamp;
  });

  readonly diaBackendAsset$ = defer(() => {
    if (this.proofOrDiaBackendAsset instanceof Proof)
      return this.diaBackendAssetRepository
        .fetchByProof$(this.proofOrDiaBackendAsset)
        .pipe(catchError(() => of(undefined)));
    return of(this.proofOrDiaBackendAsset);
  });

  readonly proof$ = defer(async () => {
    if (this.proofOrDiaBackendAsset instanceof Proof)
      return this.proofOrDiaBackendAsset;
    return undefined;
  });

  readonly isFromStore =
    this.proofOrDiaBackendAsset instanceof Proof
      ? false
      : this.proofOrDiaBackendAsset.source_type === 'store';

  readonly facts$ = defer(async () => {
    if (this.proofOrDiaBackendAsset instanceof Proof)
      return Object.values(this.proofOrDiaBackendAsset.truth.providers)[0];

    if (
      this.proofOrDiaBackendAsset.information.proof &&
      this.proofOrDiaBackendAsset.information.information
    )
      return Object.values(
        getTruth({
          proof: this.proofOrDiaBackendAsset.information.proof,
          information: this.proofOrDiaBackendAsset.information.information,
        }).providers
      )[0];
    return undefined;
  });

  readonly signature$ = defer(async () => {
    if (this.proofOrDiaBackendAsset instanceof Proof)
      return Object.values(this.proofOrDiaBackendAsset.signatures)[0];
    return Object.values(
      getSignatures(this.proofOrDiaBackendAsset.signature)
    )[0];
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

export function normalizeGeolocation({
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
