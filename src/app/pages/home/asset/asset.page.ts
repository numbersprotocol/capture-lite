import { Component } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, defer, forkJoin, zip } from 'rxjs';
import { concatMap, map, switchMap, switchMapTo, tap } from 'rxjs/operators';
import { BlockingActionService } from '../../../services/blocking-action/blocking-action.service';
import { ConfirmAlert } from '../../../services/confirm-alert/confirm-alert.service';
import { AssetRepository } from '../../../services/publisher/numbers-storage/repositories/asset/asset-repository.service';
import { getOldProof } from '../../../services/repositories/proof/old-proof-adapter';
import { ProofRepository } from '../../../services/repositories/proof/proof-repository.service';
import { isNonNullable } from '../../../utils/rx-operators';
import { ContactSelectionDialogComponent } from './contact-selection-dialog/contact-selection-dialog.component';
import {
  Option,
  OptionsMenuComponent,
} from './options-menu/options-menu.component';

const { Browser } = Plugins;

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
    switchMap(id => this.assetRepository.getById$(id)),
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
    map(([asset, proofsWithThumbnailAndOld]) => ({
      asset,
      proofWithThumbnailAndOld: proofsWithThumbnailAndOld.find(
        p => p.oldProof.hash === asset.proof_hash
      ),
    })),
    isNonNullable()
  );
  readonly base64Src$ = this.capture$.pipe(
    map(capture => capture.proofWithThumbnailAndOld),
    isNonNullable(),
    concatMap(async p => {
      const assets = await p.proof.getAssets();
      return `data:${Object.values(assets)[0].mimeType};base64,${
        Object.keys(assets)[0]
      }`;
    })
  );
  readonly timestamp$ = this.capture$.pipe(
    map(capture => capture.proofWithThumbnailAndOld?.proof.timestamp)
  );
  readonly latitude$ = this.capture$.pipe(
    map(
      capture =>
        `${capture.proofWithThumbnailAndOld?.proof.geolocationLatitude}`
    )
  );
  readonly longitude$ = this.capture$.pipe(
    map(
      capture =>
        `${capture.proofWithThumbnailAndOld?.proof.geolocationLongitude}`
    )
  );

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly translocoService: TranslocoService,
    private readonly confirmAlert: ConfirmAlert,
    private readonly assetRepository: AssetRepository,
    private readonly proofRepository: ProofRepository,
    private readonly blockingActionService: BlockingActionService,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog,
    private readonly bottomSheet: MatBottomSheet
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

  private remove() {
    const onConfirm = () =>
      this.blockingActionService
        .run$(
          zip(this.asset$, this.capture$).pipe(
            concatMap(([asset, capture]) =>
              forkJoin([
                this.assetRepository.remove$(asset),
                this.proofRepository.remove(
                  // tslint:disable-next-line: no-non-null-assertion
                  capture.proofWithThumbnailAndOld!.proof
                ),
              ])
            ),
            switchMapTo(defer(() => this.router.navigate(['..'])))
          ),
          { message: this.translocoService.translate('processing') }
        )
        .pipe(untilDestroyed(this))
        .subscribe();

    return this.confirmAlert
      .present$(onConfirm)
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  openDashboardLink() {
    this.asset$
      .pipe(
        tap(asset =>
          Browser.open({
            url: `https://authmedia.net/dia-certificate?mid=${asset.id}`,
          })
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }
}
