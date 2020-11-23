import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Information } from '../../repositories/information/information';
import { OldInformationRepository } from '../../repositories/information/information-repository.service';
import { OldProof } from '../../repositories/proof/old-proof-adapter';
import { Assets, Facts } from '../../repositories/proof/proof';

export abstract class OldInformationProvider {

  abstract readonly id: string;

  constructor(
    private readonly informationRepository: OldInformationRepository
  ) { }

  collectAndStore$(proof: OldProof) {
    return this.provide$(proof).pipe(
      switchMap(information => this.informationRepository.add$(...information))
    );
  }

  protected abstract provide$(proof: OldProof): Observable<Information[]>;
}

export interface FactsProvider {
  readonly id: string;
  provide(assets: Assets): Promise<Facts>;
}
