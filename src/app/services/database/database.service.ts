import { Inject, Injectable, Type } from '@angular/core';
import { Table, TABLE_IMPL, Tuple } from './table/table';

@Injectable({
  providedIn: 'root'
})
export class Database {

  private readonly tables = new Map<string, Table<any>>();

  constructor(
    @Inject(TABLE_IMPL) private readonly TableImpl: Type<Table<any>>
  ) { }

  getTable<T extends Tuple>(id: string): Table<T> {
    // tslint:disable-next-line: no-non-null-assertion
    if (this.tables.has(id)) { return this.tables.get(id)!; }
    return this.createTable(id);
  }

  private createTable<T extends Tuple>(id: string): Table<T> {
    const created = new this.TableImpl(id);
    this.tables.set(id, created);
    return created;
  }
}
