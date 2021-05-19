import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { ActionSheetController, NavController } from '@ionic/angular';
import { ActionSheetButton } from '@ionic/core';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  combineLatest,
  defer,
  EMPTY,
  Observable,
  of,
  ReplaySubject,
} from 'rxjs';
import {
  catchError,
  concatMap,
  concatMapTo,
  distinctUntilChanged,
  first,
  map,
  pluck,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs/operators';
import SwiperCore, { Swiper, Virtual } from 'swiper/core';
import { BlockingActionService } from '../../../shared/blocking-action/blocking-action.service';
import { ConfirmAlert } from '../../../shared/confirm-alert/confirm-alert.service';
import { ContactSelectionDialogComponent } from '../../../shared/contact-selection-dialog/contact-selection-dialog.component';
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
import { ShareService } from '../../../shared/share/share.service';
import { blobToBase64 } from '../../../utils/encoding/encoding';
import {
  isNonNullable,
  switchTap,
  VOID$,
} from '../../../utils/rx-operators/rx-operators';

SwiperCore.use([Virtual]);

const { Browser } = Plugins;

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

  private readonly initialId$ = this.route.paramMap.pipe(
    map(params => params.get('id'))
  );

  private readonly initialHash$ = this.route.paramMap.pipe(
    map(parmas => parmas.get('hash'))
  );

  readonly detailedCaptures$: Observable<DetailedCapture[]> = this.type$.pipe(
    switchMap(type => {
      if (type === 'capture') return this.fromCaptures$;
      if (type === 'post-capture') return this.fromPostCaptures$;
      if (type === 'series') return this.fromSeries$;
      return EMPTY;
    })
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

  private readonly fromPostCaptures$ = this.diaBackendAssetRepository.postCaptures$.pipe(
    pluck('results'),
    map(postCaptures =>
      postCaptures.map(
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

  private readonly fromSeries$ = this.initialId$.pipe(
    isNonNullable(),
    switchMap(id => this.diaBackendAssetRepository.fetchById$(id)),
    map(diaBackendAsset => [
      new DetailedCapture(
        diaBackendAsset,
        this.mediaStore,
        this.diaBackendAssetRepository,
        this.errorService,
        this.diaBackendAuthService,
        this.translocoService
      ),
    ])
  );

  readonly initialSlideIndex$ = combineLatest([
    this.initialId$,
    this.initialHash$,
    this.detailedCaptures$,
  ]).pipe(
    first(),
    map(([initialId, initialHash, detailedCaptures]) => {
      if (initialId) return detailedCaptures.findIndex(c => c.id === initialId);
      if (initialHash)
        return detailedCaptures.findIndex(c => c.hash === initialHash);
      return 0;
    })
  );

  private readonly initializeActiveDetailedCapture$ = combineLatest([
    this.initialId$,
    this.initialHash$,
    this.detailedCaptures$,
  ]).pipe(
    first(),
    map(([initialId, initialHash, detailedCaptures]) => {
      if (initialId) return detailedCaptures.find(c => c.id === initialId);
      if (initialHash)
        return detailedCaptures.find(c => c.hash === initialHash);
      return undefined;
    }),
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

  readonly isReadonly$ = this.type$.pipe(map(type => type === 'series'));

  constructor(
    private readonly navController: NavController,
    private readonly proofRepository: ProofRepository,
    private readonly mediaStore: MediaStore,
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository,
    private readonly errorService: ErrorService,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly translocoService: TranslocoService,
    private readonly route: ActivatedRoute,
    private readonly dialog: MatDialog,
    private readonly router: Router,
    private readonly actionSheetController: ActionSheetController,
    private readonly shareService: ShareService,
    private readonly confirmAlert: ConfirmAlert,
    private readonly blockingActionService: BlockingActionService
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

  openContactSelectionDialog() {
    const dialogRef = this.dialog.open(ContactSelectionDialogComponent, {
      minWidth: '90%',
      autoFocus: false,
      data: { email: '' },
    });
    const contact$ = dialogRef.afterClosed().pipe(isNonNullable());

    return combineLatest([contact$, this.activeDetailedCapture$])
      .pipe(first(), untilDestroyed(this))
      .subscribe(([contact, detailedCapture]) =>
        this.router.navigate(
          ['../sending-post-capture', { contact, id: detailedCapture.id }],
          { relativeTo: this.route }
        )
      );
  }

  openOptionsMenu() {
    combineLatest([
      this.activeDetailedCapture$,
      this.activeDetailedCapture$.pipe(switchMap(c => c.diaBackendAsset$)),
      this.translocoService.selectTranslateObject({
        'message.shareCapture': null,
        'message.transferCapture': null,
        'message.viewOnCaptureClub': null,
        'message.deleteCapture': null,
        'message.viewBlockchainCertificate': null,
        'message.viewSupportingVideoOnIpfs': null,
      }),
    ])
      .pipe(
        first(),
        concatMap(
          ([
            detailedCapture,
            diaBackendAsset,
            [
              messageShareCapture,
              messageTransferCapture,
              messageViewOnCaptureClub,
              messageDeleteCapture,
              messageViewBlockchainCertificate,
              messageViewSupportingVideoOnIpfs,
            ],
          ]) =>
            new Promise<void>(resolve => {
              const buttons: ActionSheetButton[] = [];
              if (diaBackendAsset?.supporting_file) {
                buttons.push({
                  text: messageViewSupportingVideoOnIpfs,
                  handler: () => {
                    this.openIpfsSupportingVideo();
                  },
                });
              }
              if (detailedCapture.id && diaBackendAsset?.sharable_copy) {
                buttons.push({
                  text: messageShareCapture,
                  handler: () => {
                    this.share();
                    resolve();
                  },
                });
              }
              if (detailedCapture.id) {
                buttons.push({
                  text: messageTransferCapture,
                  handler: () => {
                    this.openContactSelectionDialog();
                    resolve();
                  },
                });
              }
              if (diaBackendAsset?.source_type === 'store') {
                buttons.push({
                  text: messageViewOnCaptureClub,
                  handler: () => {
                    this.openCaptureClub();
                  },
                });
              }
              buttons.push({
                text: messageDeleteCapture,
                handler: () => {
                  this.remove().then(() => resolve());
                },
              });
              if (detailedCapture.id) {
                buttons.push({
                  text: messageViewBlockchainCertificate,
                  handler: () => {
                    this.openCertificate();
                    resolve();
                  },
                });
              }
              this.actionSheetController
                .create({ buttons })
                .then(sheet => sheet.present());
            })
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private openIpfsSupportingVideo() {
    return this.activeDetailedCapture$
      .pipe(
        first(),
        switchMap(
          activeDetailedCapture => activeDetailedCapture.diaBackendAsset$
        ),
        isNonNullable(),
        switchMap(diaBackendAsset => {
          if (!diaBackendAsset.supporting_file) return EMPTY;
          return Browser.open({
            url: diaBackendAsset.supporting_file.replace(
              'ipfs://',
              'https://ipfs.io/ipfs/'
            ),
            toolbarColor: '#564dfc',
          });
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private share() {
    this.activeDetailedCapture$
      .pipe(
        first(),
        concatMap(
          activeDetailedCapture => activeDetailedCapture.diaBackendAsset$
        ),
        isNonNullable(),
        concatMap(diaBackendAsset => this.shareService.share(diaBackendAsset)),
        catchError((err: unknown) => this.errorService.toastError$(err)),
        untilDestroyed(this)
      )
      .subscribe();
  }

  openCertificate() {
    combineLatest([
      this.activeDetailedCapture$,
      this.diaBackendAuthService.token$,
    ])
      .pipe(
        first(),
        concatMap(([detailedCapture, token]) =>
          defer(() =>
            Browser.open({
              url: `https://authmedia.net/dia-certificate?mid=${detailedCapture.id}&token=${token}`,
              toolbarColor: '#564dfc',
            })
          )
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private openCaptureClub() {
    return this.activeDetailedCapture$
      .pipe(
        first(),
        switchMap(
          activeDetailedCapture => activeDetailedCapture.diaBackendAsset$
        ),
        isNonNullable(),
        concatMap(diaBackendAsset =>
          Browser.open({
            url: `https://captureclub.cc/asset?mid=${diaBackendAsset.id}`,
            toolbarColor: '#564dfc',
          })
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private async remove() {
    const action$ = this.activeDetailedCapture$.pipe(
      first(),
      switchTap(activeDetailedCapture =>
        defer(() => {
          if (activeDetailedCapture.id) {
            return this.diaBackendAssetRepository.removeCaptureById$(
              activeDetailedCapture.id
            );
          }
          return VOID$;
        })
      ),
      concatMap(activeDetailedCapture => activeDetailedCapture.proof$),
      concatMap(proof => {
        if (proof) return this.proofRepository.remove(proof);
        return VOID$;
      }),
      catchError((err: unknown) => this.errorService.toastError$(err)),
      concatMapTo(defer(() => this.router.navigate(['..'])))
    );
    const result = await this.confirmAlert.present();
    if (result) {
      this.blockingActionService
        .run$(action$)
        .pipe(untilDestroyed(this))
        .subscribe();
    }
  }

  openMap() {
    return this.activeDetailedCapture$
      .pipe(
        first(),
        switchMap(capture => capture.geolocation$),
        concatMap(geolocation =>
          defer(() => {
            if (geolocation)
              return Browser.open({
                url: `https://maps.google.com/maps?q=${geolocation.latitude},${geolocation.longitude}`,
                toolbarColor: '#564dfc',
              });
            return EMPTY;
          })
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }
}

class DetailedCapture {
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
