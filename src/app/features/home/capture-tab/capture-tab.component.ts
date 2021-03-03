import { formatDate, KeyValue } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertController, ToastController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { groupBy } from 'lodash';
import { combineLatest, of } from 'rxjs';
import { catchError, concatMap, map, switchMap } from 'rxjs/operators';
import { BlockingActionService } from '../../../shared/services/blocking-action/blocking-action.service';
import { CaptureService } from '../../../shared/services/capture/capture.service';
import { DiaBackendAuthService } from '../../../shared/services/dia-backend/auth/dia-backend-auth.service';
import { getOldProof } from '../../../shared/services/repositories/proof/old-proof-adapter';
import { Proof } from '../../../shared/services/repositories/proof/proof';
import { ProofRepository } from '../../../shared/services/repositories/proof/proof-repository.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-capture-tab',
  templateUrl: './capture-tab.component.html',
  styleUrls: ['./capture-tab.component.scss'],
})
export class CaptureTabComponent {
  private isHaveImg = false;
  readonly username$ = this.diaBackendAuthService.getUsername$;
  readonly email$ = this.diaBackendAuthService.getEmail$;
  private readonly proofs$ = this.proofRepository.getAll$();
  readonly capturesByDate$ = this.proofs$.pipe(
    map(proofs => proofs.sort((a, b) => b.timestamp - a.timestamp)),
    switchMap(proofs =>
      combineLatest([of(proofs), this.captureService.collectingOldProofHashes$])
    ),
    concatMap(([proofs, collectingOldProofHashes]) =>
      Promise.all<CaptureItem>(
        proofs.map(async proof => ({
          proof,
          thumbnailUrl: await proof.getThumbnailUrl().catch(() => undefined),
          oldProofHash: getOldProof(proof).hash,
          isCollecting: collectingOldProofHashes.has(getOldProof(proof).hash),
          hasGeolocation:
            proof.geolocationLatitude !== undefined &&
            proof.geolocationLongitude !== undefined,
        }))
      )
    ),
    map(captures =>
      groupBy(captures, capture =>
        formatDate(capture.proof.timestamp, 'yyyy/MM/dd', 'en-US')
      )
    )
  );

  constructor(
    private readonly proofRepository: ProofRepository,
    private readonly captureService: CaptureService,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly alertController: AlertController,
    private readonly translocoService: TranslocoService,
    private readonly snackBar: MatSnackBar,
    private readonly blockingActionService: BlockingActionService,
    private readonly toastController: ToastController
  ) {}

  async editUsername() {
    const alert = await this.alertController.create({
      header: this.translocoService.translate('editUsername'),
      inputs: [
        {
          name: 'username',
          type: 'text',
          value: await this.diaBackendAuthService.getUsername(),
        },
      ],
      buttons: [
        {
          text: this.translocoService.translate('cancel'),
          role: 'cancel',
        },
        {
          text: this.translocoService.translate('ok'),
          handler: value => this.updateUsername(value.username),
        },
      ],
    });
    return alert.present();
  }

  private updateUsername(username: string) {
    const action$ = this.diaBackendAuthService.updateUser$({ username }).pipe(
      catchError(err => {
        this.snackBar.open(
          this.translocoService.translate('error.invalidUsername'),
          this.translocoService.translate('dismiss'),
          {
            duration: 4000,
            panelClass: ['snackbar-error'],
          }
        );
        throw err;
      })
    );
    return this.blockingActionService
      .run$(action$)
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  private async presentErrorToast(err: any) {
    return this.toastController
      .create({
        message:
          err instanceof HttpErrorResponse ? err.message : JSON.stringify(err),
        duration: 4000,
      })
      .then(toast => toast.present());
  }

  // tslint:disable-next-line: prefer-function-over-method
  keyDescendingOrder(
    a: KeyValue<number, string>,
    b: KeyValue<number, string>
  ): number {
    return a.key > b.key ? -1 : b.key > a.key ? 1 : 0;
  }

  // tslint:disable-next-line: prefer-function-over-method
  trackCaptureGroupByDate(
    _: number,
    item: { key: string; value: CaptureItem[] }
  ) {
    return item.key;
  }

  // tslint:disable-next-line: prefer-function-over-method
  trackCaptureItem(_: number, item: CaptureItem) {
    return item.oldProofHash;
  }

  UploadUserImg() {
    this.isHaveImg = !this.isHaveImg;
    console.log('Hi,UploadUserImg');
  }
}

interface CaptureItem {
  proof: Proof;
  thumbnailUrl?: string;
  oldProofHash: string;
  isCollecting: boolean;
  hasGeolocation: boolean;
}
