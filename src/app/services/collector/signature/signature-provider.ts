import { Observable } from 'rxjs';
import { pluck, switchMap } from 'rxjs/operators';
import { Proof } from '../../repositories/proof/proof';
import { Signature } from '../../repositories/signature/signature';
import { SignatureRepository } from '../../repositories/signature/signature-repository.service';
import { SerializationService } from '../../serialization/serialization.service';

export abstract class SignatureProvider {

  abstract readonly id: string;

  constructor(
    private readonly signatureRepository: SignatureRepository,
    private readonly serializationService: SerializationService
  ) { }

  signAndStore$(proof: Proof) {
    return this.serializationService.stringify$(proof).pipe(
      switchMap(serialized => this.provide$(proof, serialized)),
      switchMap(signature => this.signatureRepository.add$(signature)),
      pluck(0)
    );
  }

  protected abstract provide$(proof: Proof, serialized: string): Observable<Signature>;
}
