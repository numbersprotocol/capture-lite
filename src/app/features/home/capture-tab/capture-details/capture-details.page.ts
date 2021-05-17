import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { ActionSheetController } from '@ionic/angular';
import { ActionSheetButton } from '@ionic/core';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, defer, iif, of, zip } from 'rxjs';
import {
  catchError,
  concatMap,
  concatMapTo,
  first,
  map,
  shareReplay,
  switchMap,
} from 'rxjs/operators';
import { BlockingActionService } from '../../../../shared/blocking-action/blocking-action.service';
import { ConfirmAlert } from '../../../../shared/confirm-alert/confirm-alert.service';
import { DiaBackendAssetRepository } from '../../../../shared/dia-backend/asset/dia-backend-asset-repository.service';
import { DiaBackendAuthService } from '../../../../shared/dia-backend/auth/dia-backend-auth.service';
import { ErrorService } from '../../../../shared/error/error.service';
import { MediaStore } from '../../../../shared/media/media-store/media-store.service';
import { getOldProof } from '../../../../shared/repositories/proof/old-proof-adapter';
import { Proof } from '../../../../shared/repositories/proof/proof';
import { ProofRepository } from '../../../../shared/repositories/proof/proof-repository.service';
import { ShareService } from '../../../../shared/share/share.service';
import { blobToBase64 } from '../../../../utils/encoding/encoding';
import {
  isNonNullable,
  switchTap,
  VOID$,
} from '../../../../utils/rx-operators/rx-operators';
import { ContactSelectionDialogComponent } from './contact-selection-dialog/contact-selection-dialog.component';

const { Browser } = Plugins;

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-asset',
  templateUrl: './capture-details.page.html',
  styleUrls: ['./capture-details.page.scss'],
})
export class CaptureDetailsPage {
  readonly proof$ = this.route.paramMap.pipe(
    map(params => params.get('oldProofHash')),
    isNonNullable(),
    switchMap(async oldProofHash => {
      const all = await this.proofRepository.getAll();
      return all.find(proof => getOldProof(proof).hash === oldProofHash);
    }),
    isNonNullable(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly diaBackendAsset$ = this.proof$.pipe(
    switchMap(proof => this.diaBackendAssetRepository.fetchByProof$(proof))
  );

  readonly mimeType$ = this.proof$.pipe(
    switchMap(proof => proof.getFirstAssetMeta()),
    map(meta => meta.mimeType)
  );

  readonly assetSrc$ = this.proof$.pipe(
    switchMap(async proof => {
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
    })
  );

  readonly isRegistered$ = this.proof$.pipe(
    map(proof => !!proof.diaBackendAssetId)
  );

  readonly location$ = this.proof$.pipe(
    map(proof => {
      if (
        isValidGeolocation(proof) &&
        typeof proof.geolocationLatitude === 'number' &&
        typeof proof.geolocationLongitude === 'number'
      ) {
        const fixedLength = 6;
        return `${proof.geolocationLatitude.toFixed(
          fixedLength
        )}, ${proof.geolocationLongitude.toFixed(fixedLength)}`;
      }
      return this.translocoService.translate('locationNotProvided');
    })
  );
  readonly email$ = this.diaBackendAuthService.email$;

  readonly username$ = this.diaBackendAuthService.username$;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly confirmAlert: ConfirmAlert,
    private readonly blockingActionService: BlockingActionService,
    private readonly dialog: MatDialog,
    private readonly translocoService: TranslocoService,
    private readonly proofRepository: ProofRepository,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository,
    private readonly mediaStore: MediaStore,
    private readonly shareService: ShareService,
    private readonly errorService: ErrorService,
    private readonly actionSheetController: ActionSheetController
  ) {}

  openContactSelectionDialog() {
    const dialogRef = this.dialog.open(ContactSelectionDialogComponent, {
      minWidth: '90%',
      autoFocus: false,
      data: { email: '' },
    });
    const contact$ = dialogRef.afterClosed().pipe(isNonNullable());

    return combineLatest([contact$, this.proof$])
      .pipe(first(), untilDestroyed(this))
      .subscribe(([contact, proof]) =>
        this.router.navigate(
          ['sending-post-capture', { contact, id: proof.diaBackendAssetId }],
          { relativeTo: this.route }
        )
      );
  }

  openOptionsMenu() {
    combineLatest([
      this.proof$,
      this.diaBackendAsset$.pipe(catchError(() => of(undefined))),
      this.translocoService.selectTranslateObject({
        'message.shareCapture': null,
        'message.transferCapture': null,
        'message.deleteCapture': null,
        'message.viewBlockchainCertificate': null,
      }),
    ])
      .pipe(
        first(),
        concatMap(
          ([
            proof,
            diaBackendAsset,
            [
              messageShareCapture,
              messageTransferCapture,
              messageDeleteCapture,
              messageViewBlockchainCertificate,
            ],
          ]) =>
            new Promise<void>(resolve => {
              const buttons: ActionSheetButton[] = [];
              if (proof.diaBackendAssetId && diaBackendAsset?.sharable_copy) {
                buttons.push({
                  text: messageShareCapture,
                  handler: () => {
                    this.share();
                    resolve();
                  },
                });
              }
              if (proof.diaBackendAssetId) {
                buttons.push({
                  text: messageTransferCapture,
                  handler: () => {
                    this.openContactSelectionDialog();
                    resolve();
                  },
                });
              }
              buttons.push({
                text: messageDeleteCapture,
                handler: () => {
                  this.remove().then(() => resolve());
                },
              });
              if (proof.diaBackendAssetId) {
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

  private openCertificate() {
    zip(this.proof$, this.diaBackendAuthService.token$)
      .pipe(
        concatMap(([proof, token]) =>
          iif(
            () => proof.diaBackendAssetId !== undefined,
            defer(() =>
              Browser.open({
                url: `https://authmedia.net/dia-certificate?mid=${proof.diaBackendAssetId}&token=${token}`,
                toolbarColor: '#564dfc',
              })
            )
          )
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }

  openMap() {
    return this.proof$
      .pipe(
        concatMap(proof =>
          iif(
            () => isValidGeolocation(proof),
            defer(() =>
              Browser.open({
                url: `https://maps.google.com/maps?q=${proof.geolocationLatitude},${proof.geolocationLongitude}`,
                toolbarColor: '#564dfc',
              })
            )
          )
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private share() {
    this.proof$
      .pipe(
        concatMap(proof =>
          iif(
            () => proof.diaBackendAssetId !== undefined,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.diaBackendAssetRepository.fetchById$(proof.diaBackendAssetId!)
          )
        ),
        concatMap(diaBackendAsset => this.shareService.share(diaBackendAsset)),
        catchError((err: unknown) => this.errorService.toastError$(err)),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private async remove() {
    const action$ = this.proof$.pipe(
      switchTap(proof =>
        defer(() => {
          if (proof.diaBackendAssetId) {
            return this.diaBackendAssetRepository.removeCaptureById$(
              proof.diaBackendAssetId
            );
          }
          return VOID$;
        })
      ),
      concatMap(proof => this.proofRepository.remove(proof)),
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
}

export function isValidGeolocation(proof: Proof) {
  return proof.geolocationLatitude === undefined ||
    proof.geolocationLatitude === 'undefined' ||
    proof.geolocationLongitude === undefined ||
    proof.geolocationLongitude === 'undefined'
    ? false
    : true;
}
