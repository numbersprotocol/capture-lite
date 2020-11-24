import { Injectable } from '@angular/core';
import { defer } from 'rxjs';
import { concatMap, first, map } from 'rxjs/operators';
import { Database } from 'src/app/services/database/database.service';
import { forkJoinWithDefault } from 'src/app/utils/rx-operators';
import { NumbersStoragePublisher } from '../../numbers-storage-publisher';
import { Asset } from './asset';

@Injectable({
  providedIn: 'root'
})
export class AssetRepository {

  private readonly id = `${NumbersStoragePublisher.ID}_asset`;
  private readonly table = this.database.getTable<Asset>(this.id);

  constructor(
    private readonly database: Database
  ) { }

  getAll$() { return this.table.queryAll$(); }

  getById$(id: string) {
    return this.getAll$().pipe(
      map(assets => assets.find(asset => asset.id === id))
    );
  }

  async add(asset: Asset) { return this.table.insert([asset]); }

  remove$(asset: Asset) {
    return defer(() => this.table.delete([asset]));
  }

  removeAll$() {
    return this.table.queryAll$().pipe(
      concatMap(assets => forkJoinWithDefault(assets.map(asset => this.remove$(asset)))),
      first()
    );
  }
}
