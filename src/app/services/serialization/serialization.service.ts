import { Injectable } from '@angular/core';
import { first, map } from 'rxjs/operators';
import { Tuple } from '../database/table/table';
import { Importance, Information, InformationType } from '../repositories/information/information';
import { OldInformationRepository } from '../repositories/information/information-repository.service';
import { OldProof } from '../repositories/proof/old-proof-adapter';

export type EssentialInformation = Pick<Information, 'provider' | 'name' | 'value'>;

export interface SortedProofInformation extends Tuple {
  readonly proof: OldProof;
  readonly information: EssentialInformation[];
}

@Injectable({
  providedIn: 'root'
})
export class SerializationService {

  constructor(
    private readonly informationRepository: OldInformationRepository
  ) { }

  stringify$(proof: OldProof) {
    return this.createSortedProofInformation$(proof).pipe(
      map(sortedProofInformation => JSON.stringify(sortedProofInformation))
    );
  }

  private createSortedProofInformation$(proof: OldProof) {
    return this.informationRepository.getByProof$(proof).pipe(
      first(),
      map(informationList => {
        const sortedInformation = informationList.sort((a: Information, b: Information) => {
          const providerCompared = a.provider.localeCompare(b.provider);
          const nameCompared = a.name.localeCompare(b.name);
          const valueCompared = a.value.localeCompare(b.value);
          if (providerCompared !== 0) { return providerCompared; }
          if (nameCompared !== 0) { return nameCompared; }
          return valueCompared;
        }).map(({ provider, name, value }) => ({ provider, name, value } as EssentialInformation));
        return ({ proof, information: sortedInformation } as SortedProofInformation);
      })
    );
  }

  parse(sortedProofInformation: SortedProofInformation) {
    return {
      proof: sortedProofInformation.proof,
      information: sortedProofInformation.information.map(info => ({
        proofHash: sortedProofInformation.proof.hash,
        importance: Importance.Low,
        type: InformationType.Other,
        ...info
      } as Information))
    };
  }
}
