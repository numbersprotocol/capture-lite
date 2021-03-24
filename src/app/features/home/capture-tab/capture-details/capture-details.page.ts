import { Component } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, defer, iif, zip } from 'rxjs';
import {
  concatMap,
  concatMapTo,
  first,
  map,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs/operators';
import { BlockingActionService } from '../../../../shared/services/blocking-action/blocking-action.service';
import { ConfirmAlert } from '../../../../shared/services/confirm-alert/confirm-alert.service';
import { DiaBackendAssetRepository } from '../../../../shared/services/dia-backend/asset/dia-backend-asset-repository.service';
import { DiaBackendAuthService } from '../../../../shared/services/dia-backend/auth/dia-backend-auth.service';
import { ImageStore } from '../../../../shared/services/image-store/image-store.service';
import { getOldProof } from '../../../../shared/services/repositories/proof/old-proof-adapter';
import { Proof } from '../../../../shared/services/repositories/proof/proof';
import { ProofRepository } from '../../../../shared/services/repositories/proof/proof-repository.service';
import { ShareService } from '../../../../shared/services/share/share.service';
import { blobToBase64 } from '../../../../utils/encoding/encoding';
import {
  isNonNullable,
  switchTap,
  VOID$,
} from '../../../../utils/rx-operators/rx-operators';
import { toDataUrl } from '../../../../utils/url';
import { ContactSelectionDialogComponent } from './contact-selection-dialog/contact-selection-dialog.component';
import {
  Option,
  OptionsMenuComponent,
} from './options-menu/options-menu.component';

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

  readonly imageSrc$ = this.proof$.pipe(
    switchMap(async proof => {
      const [index, meta] = Object.entries(proof.indexedAssets)[0];
      if (!(await this.imageStore.exists(index)) && proof.diaBackendAssetId) {
        const imageBlob = await this.diaBackendAssetRepository
          .downloadFile$({ id: proof.diaBackendAssetId, field: 'asset_file' })
          .pipe(first())
          .toPromise();
        await proof.setAssets({ [await blobToBase64(imageBlob)]: meta });
      }
      return proof.getAssets();
    }),
    map(assets => Object.entries(assets)[0]),
    map(([base64, assetMeta]) => toDataUrl(base64, assetMeta.mimeType))
  );

  readonly isRegistered$ = this.proof$.pipe(
    map(proof => !!proof.diaBackendAssetId)
  );

  readonly location$ = this.proof$.pipe(
    map(proof => {
      if (isValidGeolocation(proof)) {
        return `${proof.geolocationLatitude}, ${proof.geolocationLongitude}`;
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
    private readonly bottomSheet: MatBottomSheet,
    private readonly translocoService: TranslocoService,
    private readonly proofRepository: ProofRepository,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository,
    private readonly imageStore: ImageStore,
    private readonly shareService: ShareService
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
    this.proof$
      .pipe(
        tap(proof => {
          const bottomSheetRef = this.bottomSheet.open(OptionsMenuComponent, {
            data: { proof },
          });
          bottomSheetRef
            .afterDismissed()
            .pipe(
              tap((option?: Option) => {
                if (option === Option.Share) {
                  this.share();
                } else if (option === Option.Transfer) {
                  this.openContactSelectionDialog();
                } else if (option === Option.Delete) {
                  this.remove();
                } else if (option === Option.ViewCertificate) {
                  this.openCertificate();
                }
              }),
              untilDestroyed(this)
            )
            .subscribe();
        }),
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
            // tslint:disable-next-line: no-non-null-assertion
            this.diaBackendAssetRepository.fetchById$(proof.diaBackendAssetId!)
          )
        ),
        concatMap(diaBackendAsset => this.shareService.share(diaBackendAsset)),
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
