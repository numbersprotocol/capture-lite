import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Storage } from 'src/app/utils/storage/storage';
import { Proof } from '../proof/proof';
import { Signature } from './signature';

@Injectable({
  providedIn: 'root'
})
export class SignatureRepository {

  private readonly signatureStorage = new Storage<Signature>('signature');

  refresh$() { return this.signatureStorage.refresh$(); }

  getByProof$(proof: Proof) {
    return this.signatureStorage.getAll$().pipe(
      map(signatures => signatures.filter(info => info.proofHash === proof.hash))
    );
  }

  add$(...signatures: Signature[]): Observable<Signature[]> {
    return this.signatureStorage.add$(...signatures);
  }
}
