import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { Clipboard } from '@capacitor/clipboard';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { ActionSheetButton } from '@ionic/core';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  EMPTY,
  Observable,
  ReplaySubject,
  Subject,
  combineLatest,
  defer,
} from 'rxjs';
import {
  catchError,
  concatMap,
  concatMapTo,
  distinctUntilChanged,
  finalize,
  first,
  map,
  pluck,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import SwiperCore, { Swiper, Virtual } from 'swiper';
import { BlockingActionService } from '../../../shared/blocking-action/blocking-action.service';
import { CaptureAppWebCryptoApiSignatureProvider } from '../../../shared/collector/signature/capture-app-web-crypto-api-signature-provider/capture-app-web-crypto-api-signature-provider.service';
import { ConfirmAlert } from '../../../shared/confirm-alert/confirm-alert.service';
import { ContactSelectionDialogComponent } from '../../../shared/contact-selection-dialog/contact-selection-dialog.component';
import {
  DiaBackendAsset,
  DiaBackendAssetRepository,
} from '../../../shared/dia-backend/asset/dia-backend-asset-repository.service';
import { DiaBackendAuthService } from '../../../shared/dia-backend/auth/dia-backend-auth.service';
import { BUBBLE_IFRAME_URL } from '../../../shared/dia-backend/secret';
import { DiaBackendStoreService } from '../../../shared/dia-backend/store/dia-backend-store.service';
import { DiaBackendWorkflowService } from '../../../shared/dia-backend/workflow/dia-backend-workflow.service';
import { ErrorService } from '../../../shared/error/error.service';
import { IframeService } from '../../../shared/iframe/iframe.service';
import { MediaStore } from '../../../shared/media/media-store/media-store.service';
import { NetworkService } from '../../../shared/network/network.service';
import { ProofRepository } from '../../../shared/repositories/proof/proof-repository.service';
import { ShareService } from '../../../shared/share/share.service';
import { UserGuideService } from '../../../shared/user-guide/user-guide.service';
import { browserToolbarColor } from '../../../utils/constants';
import { MimeType } from '../../../utils/mime-type';
import {
  VOID$,
  isNonNullable,
  switchTap,
} from '../../../utils/rx-operators/rx-operators';
import { getAssetProfileForNSE } from '../../../utils/url';
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
  expanded = false;
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

  private readonly shareMenuDismissed$ = new Subject<void>();

  readonly activeDetailedCapture$ = this._activeDetailedCapture$.pipe(
    distinctUntilChanged(),
    tap(
      detailedCapture =>
        (this.informationSessionService.activatedDetailedCapture =
          detailedCapture)
    )
  );

  readonly postCreationWorkflowCompleted$ = this.activeDetailedCapture$.pipe(
    switchMap(c => c.postCreationWorkflowCompleted$)
  );

  readonly isCollectedCapture$ = this.type$.pipe(
    map(type => type === 'post-capture')
  );

  userToken: string | undefined;

  readonly isFromSeriesPage$ = this.type$.pipe(map(type => type === 'series'));

  readonly networkConnected$ = this.networkService.connected$;

  readonly hasUploaded$ = this._activeDetailedCapture$.pipe(
    distinctUntilChanged(),
    map(activeDetailedCapture => !!activeDetailedCapture.id)
  );

  readonly showCaptureDetailsInIframe$ = combineLatest([
    this.networkConnected$,
    this.hasUploaded$,
  ]).pipe(
    map(([networkConnected, hasUploaded]) => networkConnected && hasUploaded)
  );

  constructor(
    private readonly sanitizer: DomSanitizer,
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
    private readonly userGuideService: UserGuideService,
    private readonly networkService: NetworkService,
    private readonly diaBackendStoreService: DiaBackendStoreService,
    private readonly iframeService: IframeService,
    private readonly capAppWebCryptoApiSignatureProvider: CaptureAppWebCryptoApiSignatureProvider
  ) {
    this.initializeActiveDetailedCapture$
      .pipe(untilDestroyed(this))
      .subscribe();

    this.diaBackendAuthService.token$
      .pipe(
        distinctUntilChanged(),
        map(token => (this.userToken = token)),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private static isSupportC2paDownloadFormat(mimeType: MimeType) {
    // https://github.com/contentauth/c2patool?tab=readme-ov-file#supported-file-formats
    return [
      'video/msvideo',
      'video/avi',
      'application-msvideo', // avi
      'image/avif', // avif
      'application/x-c2pa-manifest-store', // c2pa
      'image/x-adobe-dng', // dng
      'image/heic', // heic
      'image/heif', // heif
      'image/jpeg', // jpg, jpeg
      'audio/mp4', // m4a
      'audio/mpeg', // mp3
      'video/mp4',
      'application/mp4', // mp4
      'video/quicktime', // mov
      'image/png', // png
      'image/svg+xml', // svg
      'image/tiff', // tif, tiff
      'audio/x-wav', // wav
      'image/webp', // webp
    ].includes(mimeType);
  }

  iframeUrlFor(detailedCapture: any) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `${BUBBLE_IFRAME_URL}/asset_page?nid=${detailedCapture.id}`
    );
  }

  async ionViewDidEnter() {
    await this.userGuideService.showUserGuidesOnDetailsPage();
    await this.userGuideService.setHasOpenedDetailsPage(true);
    await this.userGuideService.setHasClickedDetailsPageOptionsMenu(true);
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
      this.capAppWebCryptoApiSignatureProvider.publicKey$,
      this.translocoService.selectTranslateObject({
        'details.shares.downloadC2pa': null,
        'details.shares.viewBlockchainProof': null,
        'details.shares.shareCapturePage': null,
        'details.shares.copyNid': null,
      }),
    ])
      .pipe(
        first(),
        concatMap(
          ([
            diaBackendAsset,
            publicKey,
            [downloadC2paText, viewProofText, shareCaptureText, copyNidText],
          ]) =>
            new Promise<void>(resolve => {
              const buttons: ActionSheetButton[] = [];
              if (
                diaBackendAsset &&
                DetailsPage.isSupportC2paDownloadFormat(
                  diaBackendAsset.asset_file_mime_type
                )
              ) {
                buttons.push({
                  text: downloadC2paText,
                  handler: async () => {
                    await this.handleDownloadC2paAction(diaBackendAsset);
                    resolve();
                  },
                });
              }
              if (
                diaBackendAsset?.owner_addresses.asset_wallet_address ===
                publicKey
              ) {
                buttons.push({
                  text: viewProofText,
                  handler: async () => {
                    await this.handleOpenProofAction(
                      diaBackendAsset.parent_asset_cid || diaBackendAsset.id
                    );
                    resolve();
                  },
                });
                buttons.push({
                  text: shareCaptureText,
                  handler: async () => {
                    const result =
                      diaBackendAsset.public_access ||
                      (await this.confirmAlert.present({
                        message:
                          this.translocoService.translate(
                            'message.assetBecomePublicAfterSharing'
                          ) + '!',
                      }));
                    if (result) {
                      this.share();
                    }
                    resolve();
                  },
                });
              }

              if (diaBackendAsset?.cid) {
                buttons.push({
                  text: copyNidText,
                  handler: () => {
                    this.copyToClipboard(diaBackendAsset.cid);
                    resolve();
                  },
                });
              }

              this.actionSheetController.create({ buttons }).then(sheet => {
                sheet.present();
                sheet.onDidDismiss().then(() => {
                  this.shareMenuDismissed$.next();
                });
              });
            })
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }

  openNetworkActions() {
    this.activeDetailedCapture$
      .pipe(
        first(),
        tap(detailedCapture => {
          this.router.navigate(['actions', { id: detailedCapture.id }], {
            relativeTo: this.route,
          });
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  async openOptionsMenuWithAvailableOptions() {
    combineLatest([
      this.networkConnected$,
      this.activeDetailedCapture$,
      this.postCreationWorkflowCompleted$,
      this.isCollectedCapture$,
      this.translocoService.selectTranslateObject({
        'details.actions.edit': null,
        'details.actions.unpublish': null,
        'details.actions.networkActions': null,
        'details.actions.remove': null,
      }),
    ])
      .pipe(
        first(),
        map(
          ([
            networkConnected,
            activeDetailedCapture,
            postCreationWorkflowCompleted,
            isCollectedCapture,
            [
              editActionText,
              unpublishActionText,
              networkActionsText,
              removeActionText,
            ],
          ]) => {
            const buttons: ActionSheetButton[] = [];

            if (
              networkConnected &&
              !isCollectedCapture &&
              activeDetailedCapture.id
            ) {
              buttons.push({
                text: editActionText,
                handler: () => this.handleEditAction(),
              });
            }
            if (
              networkConnected &&
              !isCollectedCapture &&
              activeDetailedCapture.id
            ) {
              buttons.push({
                text: unpublishActionText,
                handler: () => this.handleUnpublishAction(),
              });
            }
            if (networkConnected && postCreationWorkflowCompleted) {
              buttons.push({
                text: networkActionsText,
                handler: () => this.handleOpenNetworkActions(),
              });
            }
            buttons.push({
              text: removeActionText,
              handler: () => this.handleRemoveAction(),
              cssClass: 'details-page-options-menu-remove-button',
            });

            return this.actionSheetController
              .create({ buttons })
              .then(sheet => sheet.present());
          }
        )
      )
      .subscribe();
  }

  private async handleDownloadC2paAction(diaBackendAsset: DiaBackendAsset) {
    let fileUrl: string | undefined = undefined;
    const downloadC2paDismissed$ = new Subject<void>();
    const alert = await this.alertController.create({
      header: this.translocoService.translate(
        'details.downloadC2paProgressHeader'
      ),
      message: `<ion-spinner></ion-spinner><br>${this.translocoService.translate(
        'details.downloadC2paProgressMessage'
      )}`,
      backdropDismiss: false,
      buttons: [
        { text: this.translocoService.translate('cancel'), role: 'cancel' },
      ],
    });

    alert.onDidDismiss().then(async () => {
      downloadC2paDismissed$.next();
      if (fileUrl) {
        const from = encodeURIComponent(this.router.url);
        const url = encodeURIComponent(fileUrl);
        const link = document.createElement('a');
        link.href = `${BUBBLE_IFRAME_URL}/download?from=${from}&url=${url}`;
        link.hidden = true;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });

    defer(() => alert.present())
      .pipe(
        switchMap(() =>
          this.diaBackendAssetRepository.downloadC2pa$(diaBackendAsset.id)
        ),
        catchError((err: unknown) => {
          if (err instanceof HttpErrorResponse) {
            const errorMessage = err.error?.error?.message;
            if (errorMessage) {
              return this.errorService.toastError$(errorMessage);
            }
          }
          return this.errorService.toastError$(err);
        }),
        map(c2paResult => {
          fileUrl = c2paResult.url;
        }),
        finalize(() => alert.dismiss()),
        untilDestroyed(this),
        takeUntil(downloadC2paDismissed$)
      )
      .subscribe();
  }

  private handleEditAction() {
    combineLatest([
      this.showCaptureDetailsInIframe$,
      this.activeDetailedCapture$,
    ])
      .pipe(
        first(),
        switchTap(([showCaptureDetailsInIframe, detailedCapture]) => {
          if (!showCaptureDetailsInIframe) {
            return this.errorService.toastError$(
              this.translocoService.translate(
                'details.error.canNotPerfomEditAction'
              )
            );
          }
          return this.router.navigate(
            ['edit-caption', { id: detailedCapture.id }],
            { relativeTo: this.route }
          );
        })
      )
      .subscribe();
  }

  private async handleMintAndShareAction() {
    combineLatest([
      this.networkConnected$,
      this.activeDetailedCapture$.pipe(switchMap(c => c.diaBackendAsset$)),
      this.activeDetailedCapture$.pipe(
        switchMap(c => c.postCreationWorkflowCompleted$)
      ),
    ])
      .pipe(
        first(),
        concatMap(
          ([
            networkConnected,
            diaBackendAsset,
            postCreationWorkflowCompleted,
          ]) => {
            if (!networkConnected) {
              return this.errorService.toastError$(
                this.translocoService.translate(
                  'details.noNetworkConnectionCannotPerformAction'
                )
              );
            }

            if (
              postCreationWorkflowCompleted &&
              diaBackendAsset?.nft_token_id === null
            ) {
              return this.mintNft();
            }

            return this.errorService.toastError$(
              this.translocoService.translate(
                'details.error.canNotPerformMintAndShareAction'
              )
            );
          }
        )
      )
      .subscribe();
  }

  private async handleOpenProofAction(id: string) {
    await defer(() =>
      Browser.open({
        url: getAssetProfileForNSE(id),
        toolbarColor: browserToolbarColor,
      })
    )
      .pipe(untilDestroyed(this), takeUntil(this.shareMenuDismissed$))
      .toPromise();
  }

  private async handleUnpublishAction() {
    const unpublishAction$ = this.activeDetailedCapture$.pipe(
      first(),
      switchMap(activeDetailedCapture => {
        return this.diaBackendStoreService.listAllProducts$({
          associated_id: activeDetailedCapture.id,
          service_name: 'CaptureClub',
        });
      }),
      switchMap(response => {
        if (response.count === 0 || !response.results[0].enabled) {
          throw new Error(
            this.translocoService.translate('message.notListedInCaptureApp')
          );
        }
        return this.diaBackendStoreService.unpublish$(response.results[0].id);
      }),
      catchError((err: unknown) => this.errorService.toastError$(err))
    );

    const confirmed = await this.confirmAlert.present({
      message: this.translocoService.translate('details.confirmUnpublish'),
    });

    if (confirmed) {
      this.networkService.connected$
        .pipe(
          first(),
          concatMap(networkConnected => {
            if (!networkConnected) {
              return this.errorService.toastError$(
                this.translocoService.translate(
                  'details.noNetworkConnectionCannotPerformAction'
                )
              );
            }
            return this.blockingActionService
              .run$(unpublishAction$)
              .pipe(untilDestroyed(this));
          })
        )
        .subscribe();
    }
  }

  private handleOpenNetworkActions() {
    combineLatest([
      this.networkConnected$,
      this.activeDetailedCapture$,
      this.activeDetailedCapture$.pipe(
        switchMap(c => c.postCreationWorkflowCompleted$)
      ),
    ])
      .pipe(
        first(),
        concatMap(
          ([
            networkConnected,
            detailedCapture,
            postCreationWorkflowCompleted,
          ]) => {
            if (!networkConnected) {
              return this.errorService.toastError$(
                this.translocoService.translate(
                  'details.noNetworkConnectionCannotPerformAction'
                )
              );
            }

            if (postCreationWorkflowCompleted) {
              return this.router.navigate(
                ['actions', { id: detailedCapture.id }],
                { relativeTo: this.route }
              );
            }

            return this.errorService.toastError$(
              this.translocoService.translate(
                'details.error.canNotPerformOpenNetworkActions'
              )
            );
          }
        )
      )
      .subscribe();
  }

  private async handleRemoveAction() {
    const removeAction$ = this.activeDetailedCapture$.pipe(
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

    const confirmed = await this.confirmAlert.present();

    if (confirmed) {
      this.networkConnected$
        .pipe(
          first(),
          concatMap(networkConnected => {
            if (!networkConnected) {
              return this.errorService.toastError$(
                this.translocoService.translate(
                  'details.noNetworkConnectionCannotPerformAction'
                )
              );
            }
            return this.blockingActionService
              .run$(removeAction$)
              .pipe(untilDestroyed(this));
          })
        )
        .subscribe();
    }
  }

  private share() {
    this.activeDetailedCapture$
      .pipe(
        first(),
        concatMap(
          activeDetailedCapture => activeDetailedCapture.diaBackendAsset$
        ),
        isNonNullable(),
        concatMap(diaBackendAsset =>
          this.shareService.share(diaBackendAsset).catch(reason => {
            if (reason?.message !== 'Share canceled') {
              throw reason;
            }
          })
        ),
        catchError((err: unknown) => this.errorService.toastError$(err)),
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
                toolbarColor: browserToolbarColor,
              });
            return EMPTY;
          })
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }

  async mintNft() {
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

  togglePanel() {
    this.expanded = !this.expanded;
  }

  openPanel() {
    this.expanded = true;
  }

  closePanel() {
    this.expanded = false;
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
