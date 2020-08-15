import { TranslocoService } from '@ngneat/transloco';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Proof } from '../../data/proof/proof';
import { NotificationService } from '../../notification/notification.service';
import { Publisher } from '../publisher';
import { NumbersStorageApi } from './numbers-storage-api.service';

export class NumbersStoragePublisher extends Publisher {

  readonly name = 'Numbers Storage';

  constructor(
    translocoService: TranslocoService,
    notificationService: NotificationService,
    private readonly numbersStorageApi: NumbersStorageApi
  ) {
    super(translocoService, notificationService);
  }

  isEnabled$() {
    return this.numbersStorageApi.isEnabled$();
  }

  run$(proof: Proof): Observable<void> {
    return of(void 0).pipe(
      tap(_ => console.log(`Start publishing ${proof.hash} from ${this.name}.`)),
      delay(3000),
      tap(_ => console.log(`Finish publishing ${proof.hash} from ${this.name}.`))
    );
  }
}
