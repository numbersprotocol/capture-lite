import { Component } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { defer, zip } from 'rxjs';
import {
  concatMap,
  concatMapTo,
  first,
  map,
  shareReplay,
  switchMap,
  switchMapTo,
  tap,
} from 'rxjs/operators';
import { BlockingActionService } from '../../../../shared/services/blocking-action/blocking-action.service';
import { ConfirmAlert } from '../../../../shared/services/confirm-alert/confirm-alert.service';
import { DiaBackendAssetRepository } from '../../../../shared/services/dia-backend/asset/dia-backend-asset-repository.service';
import {
  getOldProof,
  OldDefaultInformationName,
} from '../../../../shared/services/repositories/proof/old-proof-adapter';
import { ProofRepository } from '../../../../shared/services/repositories/proof/proof-repository.service';
import { isNonNullable } from '../../../../utils/rx-operators/rx-operators';
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
  readonly asset$ = this.route.paramMap.pipe(
    map(params => params.get('id')),
    isNonNullable(),
    switchMap(id => this.diaBackendAssetRepository.getById$(id)),
    isNonNullable(),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  readonly location$ = this.asset$.pipe(
    map(asset => {
      const latitude = asset.information.information?.find(
        info => info.name === OldDefaultInformationName.GEOLOCATION_LATITUDE
      )?.value;
      const longitude = asset.information.information?.find(
        info => info.name === OldDefaultInformationName.GEOLOCATION_LONGITUDE
      )?.value;
      if (!latitude || !longitude) {
        return this.translacoService.translate('locationNotProvided');
      }
      return `${latitude}, ${longitude}`;
    })
  );

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly confirmAlert: ConfirmAlert,
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository,
    private readonly blockingActionService: BlockingActionService,
    private readonly dialog: MatDialog,
    private readonly bottomSheet: MatBottomSheet,
    private readonly translacoService: TranslocoService,
    private readonly proofRepositroy: ProofRepository
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
    const action$ = zip(this.asset$, this.proofRepositroy.getAll$()).pipe(
      first(),
      concatMap(([asset, proofs]) => {
        const proof = proofs.find(
          p => getOldProof(p).hash === asset.proof_hash
        );
        if (proof) {
          this.proofRepositroy.remove(proof);
        }
        return this.diaBackendAssetRepository
          .remove$(asset)
          .pipe(
            first(),
            concatMapTo(defer(() => this.diaBackendAssetRepository.refresh$()))
          );
      }),
      switchMapTo(defer(() => this.router.navigate(['..'])))
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
