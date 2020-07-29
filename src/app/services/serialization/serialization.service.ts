import { Injectable } from '@angular/core';
import { first, map } from 'rxjs/operators';
import { Information } from '../data/information/information';
import { InformationRepository } from '../data/information/information-repository.service';
import { Proof } from '../data/proof/proof';

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
          const proofHashCompared = a.proofHash.localeCompare(b.proofHash);
          const providerCompared = a.provider.localeCompare(b.provider);
          const nameCompared = a.name.localeCompare(b.name);
          const valueCompared = a.value.localeCompare(b.value);
          if (proofHashCompared !== 0) { return proofHashCompared; }
          if (providerCompared !== 0) { return providerCompared; }
          if (nameCompared !== 0) { return nameCompared; }
          return valueCompared;
        });
        return ({ proof, sortedInformation } as SortedProofInformation);
      })
    );
  }
}

interface SortedProofInformation {
  readonly proof: Proof;
  readonly sortedInformation: Information[];
}
