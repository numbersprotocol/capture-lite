import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { forkJoin, of, zip } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
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
    return this.getEnabledPublishers$().pipe(
      switchMap(publishers => this.alertController.create({
        header: this.translocoService.translate('selectAPublisher'),
        inputs: publishers.map((publisher, index) => ({
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
      })),
      switchMap(alertElement => alertElement.present())
    );
  }

  // XXX: Use toArray to replace forkJoin in many places!!
  // https://stackoverflow.com/questions/52156063/how-to-filter-out-observable-values-based-on-observable-property-of-each-value
  private getEnabledPublishers$() {
    return forkJoin(this.publishers.map(publisher => zip(
      of(publisher),
      publisher.isEnabled$().pipe(first())
    ))).pipe(
      map(publishersWithisEnabled => publishersWithisEnabled.filter(v => v[1]).map(v => v[0]))
    );
  }

  private getPublisherByName(name: string) {
    return this.publishers.find(publisher => publisher.name === name);
  }
}
