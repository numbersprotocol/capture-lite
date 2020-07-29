import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Proof } from '../../data/proof/proof';
import { Signature } from '../../data/signature/signature';
import { SignatureRepository } from '../../data/signature/signature-repository.service';
import { SerializationService } from '../../serialization/serialization.service';

export abstract class SignatureProvider {

  abstract readonly name: string;

  constructor(
    private readonly signatureRepository: SignatureRepository,
    private readonly serializationService: SerializationService
  ) { }

  collectAndStore$(proof: Proof) {
    return this.serializationService.stringify$(proof).pipe(
      switchMap(serialized => this.provide$(proof, serialized)),
      switchMap(signature => this.signatureRepository.add$(signature)),
      map(signatures => signatures[0])
    );
  }

  protected abstract provide$(proof: Proof, serialized: string): Observable<Signature>;
}
