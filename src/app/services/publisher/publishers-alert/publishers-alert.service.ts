import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { defer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Proof } from '../../data/proof/proof';
import { Publisher } from '../publisher';

@Injectable({
  providedIn: 'root'
})
export class PublishersAlert {

  private readonly publishers: Publisher[] = [];

  constructor(
    private readonly alertController: AlertController,
    private readonly translocoService: TranslocoService
  ) { }

  addPublisher(publisher: Publisher) {
    this.publishers.push(publisher);
  }

  present$(proof: Proof) {
    return defer(() => this.alertController.create({
      header: this.translocoService.translate('selectAPublisher'),
      inputs: this.publishers.map((publisher, index) => ({
        name: publisher.name,
        type: 'radio',
        label: publisher.name,
        value: publisher.name,
        checked: index === 0
      })),
      buttons: [{
        text: this.translocoService.translate('cancel'),
        role: 'cancel'
      }, {
        text: this.translocoService.translate('ok'),
        handler: (name) => this.getPublisherByName(name)?.publish(proof)
      }]
    })).pipe(
      switchMap(alertElement => alertElement.present())
    );
  }

  private getPublisherByName(name: string) {
    return this.publishers.find(publisher => publisher.name === name);
  }
}
