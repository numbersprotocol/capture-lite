import { Component } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, defer, forkJoin, zip } from 'rxjs';
import {
  concatMap,
  first,
  map,
  switchMap,
  switchMapTo,
  tap,
} from 'rxjs/operators';
import { BlockingActionService } from '../../../services/blocking-action/blocking-action.service';
import { ConfirmAlert } from '../../../services/confirm-alert/confirm-alert.service';
import { DiaBackendAssetRepository } from '../../../services/dia-backend/asset/dia-backend-asset-repository.service';
import { getOldProof } from '../../../services/repositories/proof/old-proof-adapter';
import { ProofRepository } from '../../../services/repositories/proof/proof-repository.service';
import { isNonNullable } from '../../../utils/rx-operators/rx-operators';
import { ContactSelectionDialogComponent } from './contact-selection-dialog/contact-selection-dialog.component';
import {
  Option,
  OptionsMenuComponent,
} from './options-menu/options-menu.component';
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-asset',
  templateUrl: './asset.page.html',
  styleUrls: ['./asset.page.scss'],
})
export class AssetPage {
  readonly asset$ = this.route.paramMap.pipe(
    map(params => params.get('id')),
    isNonNullable(),
    switchMap(id => this.diaBackendAssetRepository.getById$(id)),
    isNonNullable()
  );
  private readonly proofsWithOld$ = this.proofRepository
    .getAll$()
    .pipe(
      map(proofs =>
        proofs.map(proof => ({ proof, oldProof: getOldProof(proof) }))
      )
    );
  readonly capture$ = combineLatest([this.asset$, this.proofsWithOld$]).pipe(
    map(([asset, proofsWithOld]) => ({
      asset,
      // tslint:disable-next-line: no-non-null-assertion
      proofWithOld: proofsWithOld.find(
        p => p.oldProof.hash === asset.proof_hash
      )!,
    })),
    isNonNullable()
  );
  readonly base64Src$ = this.capture$.pipe(
    map(capture => capture.proofWithOld),
    isNonNullable(),
    concatMap(async p => {
      const assets = await p.proof.getAssets();
      return `data:${Object.values(assets)[0].mimeType};base64,${
        Object.keys(assets)[0]
      }`;
    })
  );
  readonly timestamp$ = this.capture$.pipe(
    map(capture => capture.proofWithOld?.proof.timestamp)
  );
  readonly location$ = this.capture$.pipe(
    map(capture => [
      capture.proofWithOld?.proof.geolocationLatitude,
      capture.proofWithOld?.proof.geolocationLongitude,
    ]),
    map(([latitude, longitude]) => {
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
    private readonly proofRepository: ProofRepository,
    private readonly blockingActionService: BlockingActionService,
    private readonly dialog: MatDialog,
    private readonly bottomSheet: MatBottomSheet,
    private readonly translacoService: TranslocoService
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
    const action$ = zip(this.asset$, this.capture$).pipe(
      first(),
      concatMap(([asset, capture]) =>
        forkJoin([
          this.diaBackendAssetRepository.remove$(asset).pipe(first()),
          // TODO: remove proof repo in DiaBackendAssetRepository
          this.proofRepository.remove(capture.proofWithOld.proof),
        ])
      ),
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
