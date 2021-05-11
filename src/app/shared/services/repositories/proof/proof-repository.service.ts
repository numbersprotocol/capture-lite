import { Injectable } from '@angular/core';
import { isEqual } from 'lodash-es';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { Database } from '../../database/database.service';
import { OnConflictStrategy } from '../../database/table/table';
import { MediaStore } from '../../media-store/media-store.service';
import { IndexedProofView, Proof } from './proof';

@Injectable({
  providedIn: 'root',
})
export class ProofRepository {
  private readonly table = this.database.getTable<IndexedProofView>(
    'ProofRepository'
  );

  readonly all$ = this.table.queryAll$.pipe(
    distinctUntilChanged(isEqual),
    map((indexedProofViews: IndexedProofView[]) =>
      indexedProofViews.map(view =>
        Proof.fromIndexedProofView(this.mediaStore, view)
      )
    )
  );

  constructor(
    private readonly database: Database,
    private readonly mediaStore: MediaStore
  ) {}

  async getAll() {
    const views = await this.table.queryAll();
    return views.map(view => Proof.fromIndexedProofView(this.mediaStore, view));
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

  async update(proofs: Proof[], comparator: (x: Proof, y: Proof) => boolean) {
    await this.table.update(
      proofs.map(proof => proof.getIndexedProofView()),
      (x, y) =>
        comparator(
          Proof.fromIndexedProofView(this.mediaStore, x),
          Proof.fromIndexedProofView(this.mediaStore, y)
        )
    );
    return proofs;
  }
}
