import { Injectable } from '@angular/core';
import { isEqual } from 'lodash-es';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { Database } from '../../database/database.service';
import { Tuple } from '../../database/table/table';

@Injectable({
  providedIn: 'root',
})
export class IgnoredTransactionRepository {
  private readonly table = this.database.getTable<IgnoredTransaction>(
    IgnoredTransactionRepository.name
  );

  readonly all$: Observable<string[]> = this.table.queryAll$.pipe(
    map(tuples => tuples.map(tuple => tuple.id)),
    distinctUntilChanged(isEqual)
  );

  constructor(private readonly database: Database) {}

  async add(id: string) {
    return this.table.insert([{ id }]);
  }
}

interface IgnoredTransaction extends Tuple {
  readonly id: string;
}
