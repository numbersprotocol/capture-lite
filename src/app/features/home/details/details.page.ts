import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { Clipboard } from '@capacitor/clipboard';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { ActionSheetButton } from '@ionic/core';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, defer, EMPTY, Observable, ReplaySubject } from 'rxjs';
import {
  catchError,
  concatMap,
  concatMapTo,
  distinctUntilChanged,
  first,
  map,
  pluck,
  switchMap,
  tap,
} from 'rxjs/operators';
import SwiperCore, { Swiper, Virtual } from 'swiper/core';
import { BlockingActionService } from '../../../shared/blocking-action/blocking-action.service';
import { ConfirmAlert } from '../../../shared/confirm-alert/confirm-alert.service';
import { ContactSelectionDialogComponent } from '../../../shared/contact-selection-dialog/contact-selection-dialog.component';
import { DiaBackendAssetRepository } from '../../../shared/dia-backend/asset/dia-backend-asset-repository.service';
import { DiaBackendAuthService } from '../../../shared/dia-backend/auth/dia-backend-auth.service';
import { DiaBackendWorkflowService } from '../../../shared/dia-backend/workflow/dia-backend-workflow.service';
import { ErrorService } from '../../../shared/error/error.service';
import { MediaStore } from '../../../shared/media/media-store/media-store.service';
import { ProofRepository } from '../../../shared/repositories/proof/proof-repository.service';
import { ShareService } from '../../../shared/share/share.service';
import { UserGuideService } from '../../../shared/user-guide/user-guide.service';
import {
  isNonNullable,
  switchTap,
  VOID$,
} from '../../../utils/rx-operators/rx-operators';
import { getAssetProfileUrlWithTmpToken } from '../../../utils/url';
import {
  DetailedCapture,
  InformationSessionService,
} from './information/session/information-session.service';

SwiperCore.use([Virtual]);

@UntilDestroy()
@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage {
  captionOn = true;
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
              this.translocoService,
              this.diaBackendWorkflowService
            )
        )
    )
  );

  private readonly fromPostCaptures$ =
    this.diaBackendAssetRepository.postCaptures$.pipe(
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
              this.translocoService,
              this.diaBackendWorkflowService
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
        this.translocoService,
        this.diaBackendWorkflowService
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
    distinctUntilChanged(),
    tap(
      detailedCapture =>
        (this.informationSessionService.activatedDetailedCapture =
          detailedCapture)
    )
  );

  readonly activeDetailedCaptureTmpShareToken$ =
    this._activeDetailedCapture$.pipe(
      distinctUntilChanged(),
      concatMap(({ id }) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.diaBackendAssetRepository.createTemporaryShareToken$(id!);
      })
    );

  readonly isFromSeriesPage$ = this.type$.pipe(map(type => type === 'series'));

  constructor(
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
    private readonly blockingActionService: BlockingActionService,
    private readonly informationSessionService: InformationSessionService,
    private readonly snackBar: MatSnackBar,
    private readonly diaBackendWorkflowService: DiaBackendWorkflowService,
    private readonly alertController: AlertController,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly userGuideService: UserGuideService
  ) {
    this.initializeActiveDetailedCapture$
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  async ionViewDidEnter() {
    await this.userGuideService.showUserGuidesOnDetailsPage();
    await this.userGuideService.setHasOpenedDetailsPage(true);
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

  async copyToClipboard(value: string) {
    await Clipboard.write({ string: value });
    this.snackBar.open(
      this.translocoService.translate('message.copiedToClipboard')
    );
  }

  openShareMenu() {
    combineLatest([
      this.activeDetailedCapture$.pipe(switchMap(c => c.diaBackendAsset$)),
      this.translocoService.selectTranslateObject({
        'message.copyIpfsAddress': null,
        'message.shareAssetProfile': null,
      }),
    ])
      .pipe(
        first(),
        concatMap(
          ([
            diaBackendAsset,
            [messageCopyIpfsAddress, messageShareAssetProfile],
          ]) =>
            new Promise<void>(resolve => {
              const buttons: ActionSheetButton[] = [];
              if (diaBackendAsset?.cid) {
                buttons.push({
                  text: messageCopyIpfsAddress,
                  handler: () => {
                    const ipfsAddress = `https://ipfs-pin.numbersprotocol.io/ipfs/${diaBackendAsset.cid}`;
                    this.copyToClipboard(ipfsAddress);
                    resolve();
                  },
                });
              }
              if (diaBackendAsset?.cai_file) {
                buttons.push({
                  text: messageShareAssetProfile,
                  handler: async () => {
                    const result = await this.confirmAlert.present({
                      message:
                        this.translocoService.translate(
                          'message.assetBecomePublicAfterSharing'
                        ) + '!',
                    });
                    if (result) {
                      this.share();
                    }
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

  openOptionsMenu() {
    this.userGuideService.setHasClickedDetailsPageOptionsMenu(true);
    combineLatest([
      this.activeDetailedCapture$,
      this.activeDetailedCapture$.pipe(switchMap(c => c.diaBackendAsset$)),
      this.activeDetailedCapture$.pipe(
        switchMap(c => c.postCreationWorkflowCompleted$)
      ),
      this.translocoService.selectTranslateObject({
        'message.transferOwnership': null,
        'message.viewOnCaptureClub': null,
        'message.deregisterFromNetwork': null,
        'message.mintNftToken': null,
        'message.viewBlockchainCertificate': null,
        'message.viewSupportingVideoOnIpfs': null,
        networkActions: null,
      }),
    ])
      .pipe(
        first(),
        concatMap(
          ([
            detailedCapture,
            diaBackendAsset,
            postCreationWorkflowCompleted,
            [
              messageTransferOwnership,
              messageViewOnCaptureClub,
              messageDeregisterFromNetwork,
              messageMintNftToken,
              messageViewBlockchainCertificate,
              messageViewSupportingVideoOnIpfs,
              messageNetworkActions,
            ],
          ]) =>
            new Promise<void>(resolve => {
              const buttons: ActionSheetButton[] = [];
              if (
                postCreationWorkflowCompleted &&
                diaBackendAsset?.supporting_file
              ) {
                buttons.push({
                  text: messageViewSupportingVideoOnIpfs,
                  handler: () => {
                    this.openIpfsSupportingVideo();
                  },
                });
              }
              if (postCreationWorkflowCompleted && detailedCapture.id) {
                buttons.push({
                  text: messageTransferOwnership,
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
                text: messageDeregisterFromNetwork,
                handler: () => {
                  this.remove().then(() => resolve());
                },
              });
              if (
                postCreationWorkflowCompleted &&
                diaBackendAsset?.nft_token_id === null
              ) {
                buttons.push({
                  text: messageMintNftToken,
                  handler: () => {
                    this.mintNft().then(() => resolve());
                  },
                  role: 'destructive',
                });
              }
              if (postCreationWorkflowCompleted && detailedCapture.id) {
                buttons.push({
                  text: messageViewBlockchainCertificate,
                  handler: () => {
                    this.openCertificate();
                    resolve();
                  },
                });
              }
              if (postCreationWorkflowCompleted) {
                buttons.push({
                  text: messageNetworkActions,
                  handler: () => {
                    this.router.navigate(
                      ['actions', { id: detailedCapture.id }],
                      { relativeTo: this.route }
                    );
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
              'https://ipfs-pin.numbersprotocol.io/ipfs/'
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
      this.activeDetailedCaptureTmpShareToken$,
    ])
      .pipe(
        first(),
        concatMap(([detailedCapture, tmpShareToken]) =>
          defer(() =>
            Browser.open({
              url: getAssetProfileUrlWithTmpToken(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                detailedCapture.id!,
                tmpShareToken
              ),
              toolbarColor: '#564dfc',
            })
          )
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private openCaptureClub() {
    combineLatest([
      this.activeDetailedCapture$.pipe(
        switchMap(
          activeDetailedCapture => activeDetailedCapture.diaBackendAsset$
        ),
        isNonNullable()
      ),
      this.diaBackendAuthService.token$,
    ])
      .pipe(
        first(),
        concatMap(([diaBackendAsset, token]) =>
          Browser.open({
            url: `https://captureclub.cc/asset?mid=${diaBackendAsset.id}&token=${token}`,
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

  private async mintNft() {
    const result = await this.confirmAlert.present({
      message: this.translocoService.translate('message.mintNftAlert'),
    });
    if (result) {
      const action$ = this.activeDetailedCapture$.pipe(
        first(),
        switchTap(activeDetailedCapture =>
          defer(() => {
            if (activeDetailedCapture.id) {
              return this.diaBackendAssetRepository.mintNft$(
                activeDetailedCapture.id
              );
            }
            return VOID$;
          })
        ),
        catchError((err: unknown) => {
          if (err instanceof HttpErrorResponse) {
            const errorType = err.error.error?.type;
            if (errorType === 'asset_is_being_minted')
              return this.errorService.toastError$(
                this.translocoService.translate(`error.diaBackend.${errorType}`)
              );
          }
          return this.errorService.toastError$(err);
        })
      );
      this.blockingActionService
        .run$(action$)
        .pipe(untilDestroyed(this))
        .subscribe();
    }
  }

  async editCaption() {
    return this.activeDetailedCapture$
      .pipe(
        first(),
        concatMap(activeDetailedCapture => activeDetailedCapture.caption$),
        concatMap(caption =>
          this.alertController.create({
            header: this.translocoService.translate('editCaption'),
            inputs: [
              {
                name: 'caption',
                type: 'text',
                value: caption,
              },
            ],
            buttons: [
              {
                text: this.translocoService.translate('cancel'),
                role: 'cancel',
              },
              {
                text: this.translocoService.translate('ok'),
                handler: value => this.updateCaption(value.caption),
              },
            ],
          })
        ),
        concatMap(
          alert =>
            new Promise<void>(resolve => {
              alert.present().then(() => resolve());
            })
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private updateCaption(caption: string) {
    const action$ = this.activeDetailedCapture$.pipe(
      first(),
      switchTap(activeDetailedCapture =>
        defer(() => {
          if (activeDetailedCapture.id) {
            const formData = new FormData();
            formData.append('caption', caption);
            return this.diaBackendAssetRepository.updateCapture$(
              activeDetailedCapture.id,
              formData
            );
          }
          return VOID$;
        }).pipe(
          tap(() => {
            this.captionOn = false;
            this.changeDetectorRef.detectChanges();
            this.captionOn = true;
          })
        )
      ),
      catchError((err: unknown) => {
        return this.errorService.toastError$(err);
      })
    );
    this.blockingActionService
      .run$(action$)
      .pipe(untilDestroyed(this))
      .subscribe();
  }
}
