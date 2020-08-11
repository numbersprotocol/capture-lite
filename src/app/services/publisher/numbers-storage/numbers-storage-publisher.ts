import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Proof } from '../../data/proof/proof';
import { Publisher } from '../publisher';

export class NumbersStoragePublisher extends Publisher {

  readonly name = 'Numbers Storage';

  run$(proof: Proof): Observable<void> {
    return of(void 0).pipe(
      tap(_ => console.log(`Start publishing ${proof.hash} from ${this.name}.`)),
      delay(3000),
      tap(_ => console.log(`Finish publishing ${proof.hash} from ${this.name}.`))
    );
  }
}
