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

  async present({
    header = this.translocoService.translate('areYouSure'),
    message = this.translocoService.translate('message.areYouSure'),
    confirmButtonText = this.translocoService.translate('ok'),
    cancelButtonText = this.translocoService.translate('cancel'),
  }: {
    header?: string;
    message?: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
  } = {}) {
    return new Promise<boolean>(resolve => {
      this.alertController
        .create({
          header,
          message,
          buttons: [
            {
              text:
                cancelButtonText ?? this.translocoService.translate('cancel'),
              role: 'cancel',
              handler: () => resolve(false),
            },
            {
              text: confirmButtonText ?? this.translocoService.translate('ok'),
              handler: () => resolve(true),
            },
          ],
          mode: 'md',
          backdropDismiss: false,
        })
        .then(alertElement => alertElement.present());
    });
  }
}
