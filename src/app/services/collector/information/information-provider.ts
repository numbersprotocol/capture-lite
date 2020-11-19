import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Information } from '../../repositories/information/information';
import { InformationRepository } from '../../repositories/information/information-repository.service';
import { ProofOld } from '../../repositories/proof/old-proof';
import { Assets, Facts } from '../../repositories/proof/proof';

export abstract class OldInformationProvider {

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

export interface FactsProvider {
  readonly id: string;
  provide(assets: Assets): Promise<Facts>;
}
