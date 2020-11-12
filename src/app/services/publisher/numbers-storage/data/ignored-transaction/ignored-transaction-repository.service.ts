import { Injectable } from '@angular/core';
import { concatMap, first } from 'rxjs/operators';
import { Storage } from 'src/app/utils/storage/storage';
import { NumbersStoragePublisher } from '../../numbers-storage-publisher';
import { IgnoredTransaction } from './ignored-transaction';

@Injectable({
  providedIn: 'root'
})
export class IgnoredTransactionRepository {

  private readonly ignoredTransactionStorage = new Storage<IgnoredTransaction>(`${NumbersStoragePublisher.ID}_ignoredTransaction`);

  getAll$() { return this.ignoredTransactionStorage.getAll$(); }

  add$(...ignoredTransactions: IgnoredTransaction[]) { return this.ignoredTransactionStorage.add$(...ignoredTransactions); }

  removeAll$() {
    return this.ignoredTransactionStorage.getAll$().pipe(
      concatMap(ignoredTransactions => this.ignoredTransactionStorage.remove$(...ignoredTransactions)),
      first()
    );
  }
}
