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
    return this.table.queryAll$.pipe(
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
    await this.table.insert([proof.getIndexedProofView()], onConflict, (x, y) =>
      isEqual(x.indexedAssets, y.indexedAssets)
    );
    return proof;
  }

  async remove(proof: Proof) {
    await Promise.all([
      this.table.delete([proof.getIndexedProofView()], (x, y) =>
        isEqual(x.indexedAssets, y.indexedAssets)
      ),
      proof.destroy(),
    ]);
  }

  async update(newProof: Proof, comparator: (x: Proof, y: Proof) => boolean) {
    await this.table.update(newProof.getIndexedProofView(), (x, y) =>
      comparator(
        Proof.fromIndexedProofView(this.imageStore, x),
        Proof.fromIndexedProofView(this.imageStore, y)
      )
    );
    return newProof;
  }

  async bulkUpdate(
    proofs: Proof[],
    comparator: (x: Proof, y: Proof) => boolean
  ) {
    await this.table.bulkUpdate(
      proofs.map(proof => proof.getIndexedProofView()),
      (x, y) =>
        comparator(
          Proof.fromIndexedProofView(this.imageStore, x),
          Proof.fromIndexedProofView(this.imageStore, y)
        )
    );
    return proofs;
  }
}
