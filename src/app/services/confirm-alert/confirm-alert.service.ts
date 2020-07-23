import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { defer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConfirmAlert {

  constructor(
    private readonly alertController: AlertController,
    private readonly translateService: TranslateService
  ) { }

  present$(onConfirm: () => void) {
    return defer(() => this.alertController.create({
      header: this.translateService.instant('areYouSure'),
      message: this.translateService.instant('message.areYouSure'),
      buttons: [{
        text: this.translateService.instant('cancel'),
        role: 'cancel'
      }, {
        text: this.translateService.instant('ok'),
        handler: onConfirm
      }]
    })).pipe(
      switchMap(alertElement => alertElement.present())
    );
  }
}
