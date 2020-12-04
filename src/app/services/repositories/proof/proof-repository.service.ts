import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Database } from '../../database/database.service';
import { ImageStore } from '../../image-store/image-store.service';
import { IndexedProofView, Proof } from './proof';

@Injectable({
  providedIn: 'root',
})
export class ProofRepository {
  private readonly table = this.database.getTable<IndexedProofView>(
    ProofRepository.name
  );

  constructor(
    private readonly database: Database,
    private readonly imageStore: ImageStore
  ) {}

  getAll$() {
    return this.table.queryAll$().pipe(
      map(indexedProofViews => {
        return indexedProofViews.map(view =>
          Proof.fromIndexedProofView(this.imageStore, view)
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
