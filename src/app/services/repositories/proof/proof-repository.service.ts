import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Database } from '../../database/database.service';
import { Tuple } from '../../database/table/table';
import { Proof } from './proof';

@Injectable({
  providedIn: 'root'
})
export class ProofRepository {

  private readonly id = 'proof';
  private readonly table = this.database.getTable<StringifiedProof>(this.id);

  constructor(
    private readonly database: Database
  ) { }

  getAll$() {
    return this.table.queryAll$().pipe(
      map(stringifiedProofs => stringifiedProofs.map(({ stringified }) => stringified)),
      map(stringifieds => stringifieds.map(stringified => Proof.parse(stringified)))
    );
  }

  async add(proof: Proof) {
    await this.table.insert([{ stringified: proof.stringify() }]);
    return proof;
  }

  async remove(proof: Proof) {
    await this.table.delete([{ stringified: proof.stringify() }]);
    return proof;
  }
}

interface StringifiedProof extends Tuple {
  stringified: string;
}
