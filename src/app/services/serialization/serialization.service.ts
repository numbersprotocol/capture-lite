import { Injectable } from '@angular/core';
import { first, map } from 'rxjs/operators';
import { Importance, Information, InformationType } from '../repositories/information/information';
import { InformationRepository } from '../repositories/information/information-repository.service';
import { Proof } from '../repositories/proof/proof';

export type EssentialInformation = Pick<Information, 'provider' | 'name' | 'value'>;

export interface SortedProofInformation {
  readonly proof: Proof;
  readonly information: EssentialInformation[];
}

@Injectable({
  providedIn: 'root'
})
export class SerializationService {

  constructor(
    private readonly informationRepository: InformationRepository
  ) { }

  stringify$(proof: Proof) {
    return this.createSortedProofInformation$(proof).pipe(
      map(sortedProofInformation => JSON.stringify(sortedProofInformation))
    );
  }

  private createSortedProofInformation$(proof: Proof) {
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
