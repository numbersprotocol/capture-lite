import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Database } from '../../database/database.service';
import { FileStore } from '../../file-store/file-store.service';
import { IndexedProofView, Proof } from './proof';

@Injectable({
  providedIn: 'root',
})
export class ProofRepository {
  private readonly id = ProofRepository.name;
  private readonly table = this.database.getTable<IndexedProofView>(this.id);

  constructor(
    private readonly database: Database,
    private readonly fileStore: FileStore
  ) {}

  getAll$() {
    return this.table.queryAll$().pipe(
      map(indexedProofViews => {
        return indexedProofViews.map(view =>
          Proof.fromIndexedProofView(this.fileStore, view)
        );
      })
    );
  }

  async add(proof: Proof) {
    await this.table.insert([proof.getIndexedProofView()]);
    return proof;
  }

  async remove(proof: Proof) {
    await Promise.all([
      this.table.delete([proof.getIndexedProofView()]),
      proof.destroy(),
    ]);
  }
}
