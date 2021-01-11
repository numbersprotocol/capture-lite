import { Injectable } from '@angular/core';
import { isEqual } from 'lodash';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { Database } from '../../database/database.service';
import { OnConflictStrategy } from '../../database/table/table';
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
      distinctUntilChanged(isEqual),
      map((indexedProofViews: IndexedProofView[]) => {
        return indexedProofViews.map(view =>
          Proof.fromIndexedProofView(this.imageStore, view)
        );
      })
    );
  }

  async getAll() {
    const views = await this.table.queryAll();
    return views.map(view => Proof.fromIndexedProofView(this.imageStore, view));
  }

  async add(proof: Proof, onConflict = OnConflictStrategy.ABORT) {
    await this.table.insert([proof.getIndexedProofView()], onConflict);
    return proof;
  }

  async remove(proof: Proof) {
    await Promise.all([
      this.table.delete([proof.getIndexedProofView()]),
      proof.destroy(),
    ]);
  }
}
