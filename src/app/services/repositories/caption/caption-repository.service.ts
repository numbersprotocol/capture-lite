import { Injectable } from '@angular/core';
import { defer, of } from 'rxjs';
import { concatMap, concatMapTo, first, map, switchMap } from 'rxjs/operators';
import { isNonNullable } from 'src/app/utils/rx-operators';
import { Database } from '../../database/database.service';
import { Proof } from '../proof/proof';
import { Caption } from './caption';

@Injectable({
  providedIn: 'root'
})
export class CaptionRepository {

  private readonly id = 'caption';
  private readonly table = this.database.getTable<Caption>(this.id);

  constructor(
    private readonly database: Database
  ) { }

  getByProof$(proof: Proof) {
    return this.table.queryAll$().pipe(
      map(captions => captions.find(caption => caption.proofHash === proof.hash))
    );
  }

  addOrEdit$(value: Caption) {
    return this.table.queryAll$().pipe(
      first(),
      map(captions => captions.find(caption => caption.proofHash === value.proofHash)),
      concatMap(found => {
        if (found) { return this.remove$(found); }
        return of(found);
      }),
      concatMapTo(defer(() => this.table.insert([value])))
    );
  }

  removeByProof$(proof: Proof) {
    return this.getByProof$(proof).pipe(
      first(),
      isNonNullable(),
      switchMap(caption => this.remove$(caption))
    );
  }

  remove$(...captions: Caption[]) {
    return defer(() => this.table.delete(captions));
  }
}
