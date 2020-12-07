import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Database } from '../../database/database.service';
import { Tuple } from '../../database/table/table';

@Injectable({
  providedIn: 'root',
})
export class IgnoredTransactionRepository {
  private readonly table = this.database.getTable<IgnoredTransaction>(
    IgnoredTransactionRepository.name
  );

  constructor(private readonly database: Database) {}

  getAll$() {
    return this.table
      .queryAll$()
      .pipe(map(tuples => tuples.map(tuple => tuple.id)));
  }

  async add(id: string) {
    return this.table.insert([{ id }]);
  }
}

interface IgnoredTransaction extends Tuple {
  readonly id: string;
}
