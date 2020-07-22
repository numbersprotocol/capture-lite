import { Observable } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
import { createSortedProofInformation } from 'src/app/utils/serialization/serialization';
import { InformationRepository } from '../../data/information/information-repository.service';
import { Proof } from '../../data/proof/proof';
import { Signature } from '../../data/signature/signature';
import { SignatureRepository } from '../../data/signature/signature-repository.service';

export abstract class SignatureProvider {

  abstract readonly name: string;

  constructor(
    private readonly signatureRepository: SignatureRepository,
    private readonly informationRepository: InformationRepository
  ) { }

  collectAndStore$(proof: Proof) {
    return this.informationRepository.getByProof$(proof).pipe(
      first(),
      map(informationList => createSortedProofInformation(proof, informationList)),
      switchMap(sortedProofInformation => this.provide$(proof, JSON.stringify(sortedProofInformation))),
      switchMap(signature => this.signatureRepository.add$(signature)),
      map(signatures => signatures[0])
    );
  }

  protected abstract provide$(proof: Proof, serialized: string): Observable<Signature>;
}
