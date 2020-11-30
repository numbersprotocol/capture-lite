import { Injectable } from '@angular/core';
import { defer } from 'rxjs';
import { concatMap, first } from 'rxjs/operators';
import { Database } from '../../../../../services/database/database.service';
import { NumbersStoragePublisher } from '../../numbers-storage-publisher';
import { IgnoredTransaction } from './ignored-transaction';

@Injectable({
  providedIn: 'root',
})
export class IgnoredTransactionRepository {
  private readonly id = `${NumbersStoragePublisher.ID}_ignoredTransaction`;
  private readonly table = this.database.getTable<IgnoredTransaction>(this.id);

  constructor(private readonly database: Database) {}

  getAll$() {
    return this.table.queryAll$();
  }

  add$(...ignoredTransactions: IgnoredTransaction[]) {
    return defer(() => this.table.insert(ignoredTransactions));
  }

  removeAll$() {
    return this.table.queryAll$().pipe(
      concatMap(ignoredTransactions =>
        defer(() => this.table.delete(ignoredTransactions))
      ),
      first()
    );
  }
}
