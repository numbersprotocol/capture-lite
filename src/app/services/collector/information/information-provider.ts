import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Information } from '../../repositories/information/information';
import { InformationRepository } from '../../repositories/information/information-repository.service';
import { Proof } from '../../repositories/proof/proof';

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
