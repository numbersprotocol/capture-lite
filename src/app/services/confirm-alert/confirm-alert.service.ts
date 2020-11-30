import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { defer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ConfirmAlert {
  constructor(
    private readonly alertController: AlertController,
    private readonly translocoService: TranslocoService
  ) {}

  present$(
    onConfirm: () => void,
    message: string = this.translocoService.translate('message.areYouSure')
  ) {
    return defer(() =>
      this.alertController.create({
        header: this.translocoService.translate('areYouSure'),
        message,
        buttons: [
          {
            text: this.translocoService.translate('cancel'),
            role: 'cancel',
          },
          {
            text: this.translocoService.translate('ok'),
            handler: onConfirm,
          },
        ],
        mode: 'md',
      })
    ).pipe(switchMap(alertElement => alertElement.present()));
  }
}
