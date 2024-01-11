import { Component, HostListener, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ReplaySubject, combineLatest, iif, of } from 'rxjs';
import {
  catchError,
  concatMap,
  distinctUntilChanged,
  first,
  map,
  shareReplay,
  switchMap,
} from 'rxjs/operators';
import { CaptureService } from '../../../../shared/capture/capture.service';
import { DiaBackendAssetRepository } from '../../../../shared/dia-backend/asset/dia-backend-asset-repository.service';
import { getOldProof } from '../../../../shared/repositories/proof/old-proof-adapter';
import { Proof } from '../../../../shared/repositories/proof/proof';
import { normalizeGeolocation } from '../../details/information/session/information-session.service';

@UntilDestroy()
@Component({
  selector: 'app-capture-item',
  templateUrl: './capture-item.component.html',
  styleUrls: ['./capture-item.component.scss'],
})
export class CaptureItemComponent {
  private readonly proof$ = new ReplaySubject<Proof>(1);

  @Input()
  set proof(value: Proof | undefined) {
    if (value) this.proof$.next(value);
  }

  private readonly oldProofHash$ = this.proof$.pipe(
    map(proof => getOldProof(proof).hash)
  );

  readonly thumbnailUrl$ = this.proof$.pipe(
    distinctUntilChanged((x, y) => getOldProof(x).hash === getOldProof(y).hash),
    switchMap(proof => proof.thumbnailUrl$),
    map(url => {
      if (url) return this.sanitizer.bypassSecurityTrustUrl(url);
      return undefined;
    }),
    catchError(() => of(undefined)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly hasUploaded$ = this.proof$.pipe(
    map(proof => !!proof.diaBackendAssetId)
  );

  readonly isCollecting$ = combineLatest([
    this.oldProofHash$,
    this.captureService.collectingOldProofHashes$,
  ]).pipe(
    map(([oldProofHash, collectingOldProofHashes]) =>
      collectingOldProofHashes.has(oldProofHash)
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly hasGeolocation$ = this.proof$.pipe(
    map(
      proof =>
        !!normalizeGeolocation({
          latitude: proof.geolocationLatitude,
          longitude: proof.geolocationLongitude,
        })
    )
  );

  readonly hasCaption$ = this.proof$.pipe(map(proof => proof.caption !== ''));

  readonly isVideo$ = this.proof$.pipe(
    concatMap(proof => proof.getFirstAssetMeta()),
    map(meta => meta.mimeType.startsWith('video'))
  );

  readonly isThumbnailMissing$ = this.thumbnailUrl$.pipe(map(url => !url));

  constructor(
    private readonly captureService: CaptureService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly sanitizer: DomSanitizer,
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository
  ) {}

  @HostListener('click')
  async onClick() {
    this.isCollecting$
      .pipe(
        first(),
        switchMap(isCollecting =>
          iif(
            () => !isCollecting,
            this.oldProofHash$.pipe(
              first(),
              concatMap(oldProofHash =>
                this.router.navigate(
                  ['details', { type: 'capture', hash: oldProofHash }],
                  { relativeTo: this.route }
                )
              )
            )
          )
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }
}
