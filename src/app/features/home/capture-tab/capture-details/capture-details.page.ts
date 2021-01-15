import { Component } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { defer } from 'rxjs';
import {
  concatMap,
  concatMapTo,
  map,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs/operators';
import { BlockingActionService } from '../../../../shared/services/blocking-action/blocking-action.service';
import { ConfirmAlert } from '../../../../shared/services/confirm-alert/confirm-alert.service';
import { DiaBackendAssetRepository } from '../../../../shared/services/dia-backend/asset/dia-backend-asset-repository.service';
import { DiaBackendAuthService } from '../../../../shared/services/dia-backend/auth/dia-backend-auth.service';
import { getOldProof } from '../../../../shared/services/repositories/proof/old-proof-adapter';
import { ProofRepository } from '../../../../shared/services/repositories/proof/proof-repository.service';
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
    switchMap(proof => proof.getAssets()),
    map(assets => Object.entries(assets)[0]),
    map(([base64, assetMeta]) => toDataUrl(base64, assetMeta.mimeType))
  );
  readonly location$ = this.proof$.pipe(
    map(proof => {
      const latitude = proof.geolocationLatitude;
      const longitude = proof.geolocationLongitude;
      if (!latitude || !longitude) {
        return this.translacoService.translate('locationNotProvided');
      }
      return `${latitude}, ${longitude}`;
    })
  );
  readonly email$ = this.diaBackendAuthService.getEmail$;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly confirmAlert: ConfirmAlert,
    private readonly blockingActionService: BlockingActionService,
    private readonly dialog: MatDialog,
    private readonly bottomSheet: MatBottomSheet,
    private readonly translacoService: TranslocoService,
    private readonly proofRepository: ProofRepository,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository
  ) {}

  openContactSelectionDialog() {
    const dialogRef = this.dialog.open(ContactSelectionDialogComponent, {
      minWidth: '90%',
      autoFocus: false,
      data: { email: '' },
    });
    dialogRef
      .afterClosed()
      .pipe(isNonNullable())
      .subscribe(result =>
        this.router.navigate(['sending-post-capture', { contact: result }], {
          relativeTo: this.route,
        })
      );
  }

  openOptionsMenu() {
    const bottomSheetRef = this.bottomSheet.open(OptionsMenuComponent);
    bottomSheetRef
      .afterDismissed()
      .pipe(
        tap((option?: Option) => {
          if (option === Option.Delete) {
            this.remove();
          }
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private async remove() {
    const action$ = this.proof$.pipe(
      switchTap(proof =>
        defer(() => {
          if (proof.diaBackendAssetId) {
            return this.diaBackendAssetRepository.removeById$(
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
