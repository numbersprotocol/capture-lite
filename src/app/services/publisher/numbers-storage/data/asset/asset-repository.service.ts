import { Injectable } from '@angular/core';
import { concatMapTo, map } from 'rxjs/operators';
import { ProofRepository } from 'src/app/services/data/proof/proof-repository.service';
import { Storage } from 'src/app/utils/storage/storage';
import { NumbersStoragePublisher } from '../../numbers-storage-publisher';
import { Asset } from './asset';

@Injectable({
  providedIn: 'root'
})
export class AssetRepository {

  private readonly assetStorage = new Storage<Asset>(`${NumbersStoragePublisher.ID}_asset`);

  constructor(
    private readonly proofRepository: ProofRepository
  ) { }

  getAll$() { return this.assetStorage.getAll$(); }

  getById$(id: string) {
    return this.getAll$().pipe(
      map(assets => assets.find(asset => asset.id === id))
    );
  }

  add$(...assets: Asset[]) { return this.assetStorage.add$(...assets); }

  remove$(asset: Asset) {
    return this.assetStorage.remove$(asset).pipe(
      concatMapTo(this.proofRepository.removeByHash$(asset.proof_hash))
    );
  }
}
