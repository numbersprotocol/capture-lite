import { Injectable } from '@angular/core';
import { concatMap, concatMapTo, map, mapTo } from 'rxjs/operators';
import { CaptionRepository } from 'src/app/services/data/caption/caption-repository.service';
import { Information } from 'src/app/services/data/information/information';
import { InformationRepository } from 'src/app/services/data/information/information-repository.service';
import { Proof } from 'src/app/services/data/proof/proof';
import { ProofRepository } from 'src/app/services/data/proof/proof-repository.service';
import { SignatureRepository } from 'src/app/services/data/signature/signature-repository.service';
import { SerializationService } from 'src/app/services/serialization/serialization.service';
import { blobToDataUrlWithBase64$ } from 'src/app/utils/encoding/encoding';
import { Storage } from 'src/app/utils/storage/storage';
import { NumbersStorageApi } from '../../numbers-storage-api.service';
import { NumbersStoragePublisher } from '../../numbers-storage-publisher';
import { Asset } from './asset';

@Injectable({
  providedIn: 'root'
})
export class AssetRepository {

  private readonly assetStorage = new Storage<Asset>(`${NumbersStoragePublisher.ID}_asset`);

  constructor(
    private readonly numbersStorageApi: NumbersStorageApi,
    private readonly proofRepository: ProofRepository,
    private readonly informationRepository: InformationRepository,
    private readonly signatureRepository: SignatureRepository,
    private readonly captionRepository: CaptionRepository,
    private readonly serializationService: SerializationService
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

  addFromNumbersStorage$(asset: Asset) {
    return this.add$(asset).pipe(
      concatMapTo(this.storeProofMedia$(asset)),
      mapTo(this.serializationService.parse(asset.information)),
      concatMap(parsed => this.addProofAndInformationFromParsedInformation$(parsed)),
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

  private addProofAndInformationFromParsedInformation$(parsed: { proof: Proof, information: Information[]; }) {
    return this.proofRepository.add$(parsed.proof).pipe(
      concatMapTo(this.informationRepository.add$(...parsed.information))
    );
  }
}
