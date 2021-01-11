import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';

@Injectable({
  providedIn: 'root',
})
export class ConfirmAlert {
  constructor(
    private readonly alertController: AlertController,
    private readonly translocoService: TranslocoService
  ) {}

  async present(
    message: string = this.translocoService.translate('message.areYouSure')
  ) {
    return new Promise<boolean>(resolve => {
      this.alertController
        .create({
          header: this.translocoService.translate('areYouSure'),
          message,
          buttons: [
            {
              text: this.translocoService.translate('cancel'),
              role: 'cancel',
              handler: () => resolve(false),
            },
            {
              text: this.translocoService.translate('ok'),
              handler: () => resolve(true),
            },
          ],
          mode: 'md',
        })
        .then(alertElement => alertElement.present());
    });
  }
}
