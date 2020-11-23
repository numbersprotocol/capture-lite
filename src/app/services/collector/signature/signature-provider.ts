import { Observable } from 'rxjs';
import { pluck, switchMap } from 'rxjs/operators';
import { OldProof } from '../../repositories/proof/old-proof-adapter';
import { Signature } from '../../repositories/proof/proof';
import { OldSignature } from '../../repositories/signature/signature';
import { OldSignatureRepository } from '../../repositories/signature/signature-repository.service';
import { SerializationService } from '../../serialization/serialization.service';
export abstract class OldSignatureProvider {

  abstract readonly id: string;

  constructor(
    private readonly signatureRepository: OldSignatureRepository,
    private readonly serializationService: SerializationService
  ) { }

  signAndStore$(proof: OldProof) {
    return this.serializationService.stringify$(proof).pipe(
      switchMap(serialized => this.provide$(proof, serialized)),
      switchMap(signature => this.signatureRepository.add$(signature)),
      pluck(0)
    );
  }

  protected abstract provide$(proof: OldProof, serialized: string): Observable<OldSignature>;
}

export interface SignatureProvider {
  readonly id: string;
  provide(serializedSortedSignTargets: string): Promise<Signature>;
}
