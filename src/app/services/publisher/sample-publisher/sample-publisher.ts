import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Proof } from '../../data/proof/proof';
import { Publisher } from '../publisher';

export class SamplePublisher extends Publisher {

  readonly name = 'Sample Publisher';

  run$(proof: Proof): Observable<void> {
    return of(void 0).pipe(delay(3000));
  }

  isEnabled$() {
    return of(true);
  }
}
