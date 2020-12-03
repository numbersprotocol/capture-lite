import { Injectable } from '@angular/core';
import { concatMap, map } from 'rxjs/operators';
import { Database } from '../../database/database.service';
import { Tuple } from '../../database/table/table';
import { FileStore } from '../../file-store/file-store.service';
import { Proof } from './proof';

@Injectable({
  providedIn: 'root',
})
export class ProofRepository {
  private readonly id = ProofRepository.name;
  private readonly table = this.database.getTable<StringifiedProof>(this.id);

  constructor(
    private readonly database: Database,
    private readonly fileStore: FileStore
  ) {}

  getAll$() {
    return this.table.queryAll$().pipe(
      map(stringifiedProofs =>
        stringifiedProofs.map(({ stringified }) => stringified)
      ),
      concatMap(stringifieds =>
        Promise.all(
          stringifieds.map(stringified =>
            Proof.parse(this.fileStore, stringified)
          )
        )
      )
    );
  }

  async add(proof: Proof) {
    await this.table.insert([{ stringified: await proof.stringify() }]);
    return proof;
  }

  async remove(proof: Proof) {
    await this.table.delete([{ stringified: await proof.stringify() }]);
    return proof;
  }
}

interface StringifiedProof extends Tuple {
  stringified: string;
}
