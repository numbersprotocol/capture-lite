import { Observable } from 'rxjs';
import { subscribeInBackground } from 'src/app/utils/background-task/background-task';
import { Proof } from '../data/proof/proof';

export abstract class Publisher {

  abstract readonly name: string;

  publish(proof: Proof) {
    subscribeInBackground(this.run$(proof));
  }

  protected abstract run$(proof: Proof): Observable<void>;
}
