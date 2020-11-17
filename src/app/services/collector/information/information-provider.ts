import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Information } from '../../repositories/information/information';
import { InformationRepository } from '../../repositories/information/information-repository.service';
import { ProofOld } from '../../repositories/proof/old-proof';

export abstract class InformationProvider {

  abstract readonly id: string;

  constructor(
    private readonly informationRepository: InformationRepository
  ) { }

  collectAndStore$(proof: ProofOld) {
    return this.provide$(proof).pipe(
      switchMap(information => this.informationRepository.add$(...information))
    );
  }

  protected abstract provide$(proof: ProofOld): Observable<Information[]>;
}
