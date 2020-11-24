import { Injectable } from '@angular/core';
import { defer } from 'rxjs';
import { concatMap, concatMapTo, first, map } from 'rxjs/operators';
import { Database } from 'src/app/services/database/database.service';
import { CaptionRepository } from 'src/app/services/repositories/caption/caption-repository.service';
import { Information } from 'src/app/services/repositories/information/information';
import { OldInformationRepository } from 'src/app/services/repositories/information/information-repository.service';
import { OldProof } from 'src/app/services/repositories/proof/old-proof-adapter';
import { OldProofRepository } from 'src/app/services/repositories/proof/old-proof-repository.service';
import { OldSignatureRepository } from 'src/app/services/repositories/signature/signature-repository.service';
import { SerializationService } from 'src/app/services/serialization/serialization.service';
import { blobToDataUrlWithBase64$ } from 'src/app/utils/encoding/encoding';
import { forkJoinWithDefault } from 'src/app/utils/rx-operators';
import { NumbersStorageApi } from '../../numbers-storage-api.service';
import { NumbersStoragePublisher } from '../../numbers-storage-publisher';
import { Asset } from './asset';

@Injectable({
  providedIn: 'root'
})
export class AssetRepository {

  private readonly id = `${NumbersStoragePublisher.ID}_asset`;
  private readonly table = this.database.getTable<Asset>(this.id);

  constructor(
    private readonly database: Database,
    private readonly numbersStorageApi: NumbersStorageApi,
    private readonly proofRepository: OldProofRepository,
    private readonly informationRepository: OldInformationRepository,
    private readonly signatureRepository: OldSignatureRepository,
    private readonly captionRepository: CaptionRepository,
    private readonly serializationService: SerializationService
  ) { }

  getAll$() { return this.table.queryAll$(); }

  getById$(id: string) {
    return this.getAll$().pipe(
      map(assets => assets.find(asset => asset.id === id))
    );
  }

  add$(...assets: Asset[]) { return defer(() => this.table.insert(assets)); }

  async add(asset: Asset) { return this.table.insert([asset]); }

  addFromNumbersStorage$(asset: Asset) {
    return this.add$(asset).pipe(
      concatMapTo(this.storeProofMedia$(asset)),
      concatMapTo(this.addProofAndInformationFromParsedInformation$(this.serializationService.parse(asset.information))),
      concatMapTo(this.signatureRepository.add$(...asset.signature)),
      concatMapTo(this.captionRepository.addOrEdit$({ proofHash: asset.proof_hash, text: asset.caption }))
    );
  }

  private storeProofMedia$(asset: Asset) {
    return this.numbersStorageApi.getImage$(asset.asset_file).pipe(
      concatMap(blob => blobToDataUrlWithBase64$(blob)),
      map(dataUrlWithBase64 => dataUrlWithBase64.split(',')[1]),
      concatMap(base64 => this.proofRepository.saveRawFile$(base64, asset.information.proof.mimeType))
    );
  }

  private addProofAndInformationFromParsedInformation$(parsed: { proof: OldProof, information: Information[]; }) {
    return this.proofRepository.add$(parsed.proof).pipe(
      concatMapTo(this.informationRepository.add$(...parsed.information))
    );
  }

  remove$(asset: Asset) {
    return defer(() => this.table.delete([asset])).pipe(
      concatMapTo(this.proofRepository.removeByHash$(asset.proof_hash))
    );
  }

  removeAll$() {
    return this.table.queryAll$().pipe(
      concatMap(assets => forkJoinWithDefault(assets.map(asset => this.remove$(asset)))),
      first()
    );
  }
}
