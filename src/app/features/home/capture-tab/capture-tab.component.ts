import { formatDate, KeyValue } from '@angular/common';
import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { groupBy } from 'lodash-es';
import { map } from 'rxjs/operators';
import { BlockingActionService } from '../../../shared/services/blocking-action/blocking-action.service';
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
  readonly username$ = this.diaBackendAuthService.username$;

  readonly email$ = this.diaBackendAuthService.email$;

  private readonly proofs$ = this.proofRepository.all$;

  readonly capturesByDate$ = this.proofs$.pipe(
    map(proofs => proofs.sort((a, b) => b.timestamp - a.timestamp)),
    map(proofs =>
      groupBy(proofs, proof =>
        formatDate(proof.timestamp, 'yyyy/MM/dd', 'en-US')
      )
    )
  );

  constructor(
    private readonly proofRepository: ProofRepository,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly alertController: AlertController,
    private readonly translocoService: TranslocoService,
    private readonly snackBar: MatSnackBar,
    private readonly blockingActionService: BlockingActionService
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
    const action$ = this.diaBackendAuthService.updateUser$({ username });
    return this.blockingActionService
      .run$(action$)
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  // eslint-disable-next-line class-methods-use-this
  keyDescendingOrder(
    a: KeyValue<string, Proof[]>,
    b: KeyValue<string, Proof[]>
  ): number {
    return a.key > b.key ? -1 : b.key > a.key ? 1 : 0;
  }

  // eslint-disable-next-line class-methods-use-this
  trackCaptureGroupByDate(_: number, item: { key: string; value: Proof[] }) {
    return item.key;
  }

  // eslint-disable-next-line class-methods-use-this
  trackCaptureItem(_: number, item: Proof) {
    return getOldProof(item).hash;
  }
}
