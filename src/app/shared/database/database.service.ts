import { Inject, Injectable } from '@angular/core';
import { FilesystemPlugin } from '@capacitor/core';
import { FILESYSTEM_PLUGIN } from '../capacitor-plugins/capacitor-plugins.module';
import { CapacitorFilesystemTable } from './table/capacitor-filesystem-table/capacitor-filesystem-table';
import { Table, Tuple } from './table/table';

@Injectable({
  providedIn: 'root',
})
export class Database {
  private readonly tables = new Map<string, Table<any>>();

  constructor(
    @Inject(FILESYSTEM_PLUGIN)
    private readonly filesystemPlugin: FilesystemPlugin
  ) {}

  getTable<T extends Tuple>(id: string): Table<T> {
    if (this.tables.has(id)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.tables.get(id)!;
    }
    return this.createTable(id);
  }

  private createTable<T extends Tuple>(id: string): Table<T> {
    const created = new CapacitorFilesystemTable<T>(id, this.filesystemPlugin);
    this.tables.set(id, created);
    return created;
  }

  async clear() {
    return Promise.all([...this.tables.values()].map(table => table.clear()));
  }
}
