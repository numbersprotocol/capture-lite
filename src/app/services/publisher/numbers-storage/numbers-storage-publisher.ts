import { TranslocoService } from '@ngneat/transloco';
import { Observable, zip } from 'rxjs';
import { concatMap, first, mapTo } from 'rxjs/operators';
import { NotificationService } from '../../notification/notification.service';
import { CaptionRepository } from '../../repositories/caption/caption-repository.service';
import { getOldProof, getOldSignatures, OldProof } from '../../repositories/proof/old-proof-adapter';
import { OldProofRepository } from '../../repositories/proof/old-proof-repository.service';
import { Proof } from '../../repositories/proof/proof';
import { OldSignatureRepository } from '../../repositories/signature/signature-repository.service';
import { Publisher } from '../publisher';
import { AssetRepository } from './data/asset/asset-repository.service';
import { NumbersStorageApi, TargetProvider } from './numbers-storage-api.service';

export class NumbersStoragePublisher extends Publisher {

  static readonly ID = 'Numbers Storage';

  readonly id = NumbersStoragePublisher.ID;

  constructor(
    translocoService: TranslocoService,
    notificationService: NotificationService,
    private readonly oldProofRepository: OldProofRepository,
    private readonly signatureRepository: OldSignatureRepository,
    private readonly captionRepository: CaptionRepository,
    private readonly numbersStorageApi: NumbersStorageApi,
    private readonly assetRepository: AssetRepository
  ) {
    super(translocoService, notificationService);
  }

  isEnabled$() {
    return this.numbersStorageApi.isEnabled$();
  }

  oldRun$(proof: OldProof): Observable<void> {
    return zip(
      this.oldProofRepository.getRawFile$(proof),
      this.signatureRepository.getByProof$(proof),
      this.captionRepository.getByProof$(proof),
    ).pipe(
      first(),
      concatMap(([rawFileBase64, signatures, caption]) => this.numbersStorageApi.createAsset$(
        `data:${proof.mimeType};base64,${rawFileBase64}`,
        proof,
        TargetProvider.Numbers,
        JSON.stringify(caption ? caption : ''),
        signatures,
        'capture-lite'
      )),
      concatMap(asset => this.assetRepository.add$(asset)),
      mapTo(void 0)
    );
  }

  async run(proof: Proof) {
    const oldProof = await getOldProof(proof);
    const oldSignatures = await getOldSignatures(proof);
    const assetResponse = await this.numbersStorageApi.createAsset$(
      `data:${Object.values(proof.assets)[0].mimeType};base64,${Object.keys(proof.assets)[0]}`,
      oldProof,
      TargetProvider.Numbers,
      'FIXME',
      oldSignatures,
      'capture-lite'
    ).toPromise();
    await this.assetRepository.add(assetResponse);
    return proof;
  }
}
