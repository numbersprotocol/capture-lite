import { Injectable } from '@angular/core';
import { defer } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
import { Database } from '../../database/database.service';
import { Proof } from '../proof/proof';
import { Signature } from './signature';

@Injectable({
  providedIn: 'root'
})
export class SignatureRepository {

  private readonly id = 'signature';
  private readonly table = this.database.getTable<Signature>(this.id);

  constructor(
    private readonly database: Database
  ) { }

  getByProof$(proof: Proof) {
    return this.table.queryAll$().pipe(
      map(signatures => signatures.filter(info => info.proofHash === proof.hash))
    );
  }

  add$(...signatures: Signature[]) {
    return defer(() => this.table.insert(signatures));
  }

  removeByProof$(proof: Proof) {
    return this.getByProof$(proof).pipe(
      first(),
      switchMap(signatures => this.remove$(...signatures))
    );
  }

  remove$(...signatures: Signature[]) {
    return defer(() => this.table.delete(signatures));
  }
}
