import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { from, of, zip } from 'rxjs';
import { filter, first, pluck, switchMap, toArray } from 'rxjs/operators';
import { Proof } from '../../repositories/proof/proof';
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

  async presentOrPublish(proof: Proof) {
    const publishers = await this.getEnabledPublishers$().toPromise();

    if (publishers.length > 1) {
      const alert = await this.alertController.create({
        header: this.translocoService.translate('selectAPublisher'),
        inputs: publishers.map((publisher, index) => ({
          name: publisher.id,
          type: 'radio',
          label: publisher.id,
          value: publisher.id,
          checked: index === 0
        })),
        buttons: [{
          text: this.translocoService.translate('cancel'),
          role: 'cancel'
        }, {
          text: this.translocoService.translate('ok'),
          handler: name => this.getPublisherByName(name)?.publish(proof)
        }],
        mode: 'md'
      });
      alert.present();
    } else {
      return publishers[0].publish(proof);
    }
  }

  private getEnabledPublishers$() {
    return from(this.publishers).pipe(
      switchMap(publisher => zip(of(publisher), publisher.isEnabled$().pipe(first()))),
      filter(([_, isEnabled]) => isEnabled),
      pluck(0),
      toArray()
    );
  }

  private getPublisherByName(name: string) {
    return this.publishers.find(publisher => publisher.id === name);
  }
}
