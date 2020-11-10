import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { defer } from 'rxjs';
import { map, pluck, switchMap, switchMapTo } from 'rxjs/operators';
import { BlockingActionService } from 'src/app/services/blocking-action/blocking-action.service';
import { CapacitorProvider } from 'src/app/services/collector/information/capacitor-provider/capacitor-provider';
import { ConfirmAlert } from 'src/app/services/confirm-alert/confirm-alert.service';
import { CaptionRepository } from 'src/app/services/data/caption/caption-repository.service';
import { InformationRepository } from 'src/app/services/data/information/information-repository.service';
import { ProofRepository } from 'src/app/services/data/proof/proof-repository.service';
import { isNonNullable } from 'src/app/utils/rx-operators';
import { ContactSelectionDialogComponent, SelectedContact } from './contact-selection-dialog/contact-selection-dialog.component';

const { Clipboard } = Plugins;

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-proof',
  templateUrl: './proof.page.html',
  styleUrls: ['./proof.page.scss'],
})
export class ProofPage {

  readonly proof$ = this.route.paramMap.pipe(
    map(params => params.get('hash')),
    isNonNullable(),
    switchMap(hash => this.proofRepository.getByHash$(hash)),
    isNonNullable()
  );
  readonly base64Src$ = this.proof$.pipe(
    switchMap(proof => this.proofRepository.getRawFile$(proof)),
    map(rawBase64 => `data:image/png;base64,${rawBase64}`)
  );
  readonly caption$ = this.proof$.pipe(
    switchMap(proof => this.captionRepository.getByProof$(proof)),
    map(caption => {
      if (caption && caption.text.length > 0) { return caption.text; }
      return '';
    })
  );
  readonly timestamp$ = this.proof$.pipe(pluck('timestamp'));
  readonly location$ = this.proof$.pipe(
    switchMap(proof => this.informationRepository.getByProof$(proof)),
    map(informationList => informationList.find(information => information.provider === CapacitorProvider.ID && information.name === 'Location')),
    isNonNullable(),
    pluck('value')
  );

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly translocoService: TranslocoService,
    private readonly confirmAlert: ConfirmAlert,
    private readonly proofRepository: ProofRepository,
    private readonly captionRepository: CaptionRepository,
    private readonly informationRepository: InformationRepository,
    private readonly blockingActionService: BlockingActionService,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog
  ) { }

  openContactSelectionDialog() {
    const dialogRef = this.dialog.open(ContactSelectionDialogComponent, {
      minWidth: '90%',
      autoFocus: false,
      data: { email: '' } as SelectedContact
    });
    dialogRef.afterClosed()
      .pipe(isNonNullable())
      .subscribe(result => this.router.navigate(
        ['sending-post-capture', { contact: result }],
        { relativeTo: this.route }
      ));
  }

  remove() {
    const onConfirm = () => this.blockingActionService.run$(
      this.proof$.pipe(
        switchMap(proof => this.proofRepository.remove$(proof)),
        switchMapTo(defer(() => this.router.navigate(['..'])))
      ),
      { message: this.translocoService.translate('processing') }
    ).pipe(untilDestroyed(this)).subscribe();

    return this.confirmAlert.present$(onConfirm).pipe(untilDestroyed(this)).subscribe();
  }

  copyToClipboard(value: string) {
    Clipboard.write({ string: value });
    this.snackBar.open(this.translocoService.translate('message.copiedToClipboard'));
  }
}
