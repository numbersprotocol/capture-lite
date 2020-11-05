import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Information } from '../../data/information/information';
import { InformationRepository } from '../../data/information/information-repository.service';
import { Proof } from '../../data/proof/proof';

export abstract class InformationProvider {

  abstract readonly id: string;

  constructor(
    private readonly informationRepository: InformationRepository
  ) { }

  collectAndStore$(proof: Proof) {
    return this.provide$(proof).pipe(
      switchMap(information => this.informationRepository.add$(...information))
    );
  }

  protected abstract provide$(proof: Proof): Observable<Information[]>;
}
