import { TranslocoService } from '@ngneat/transloco';
import { Observable, zip } from 'rxjs';
import { concatMap, first, mapTo, tap } from 'rxjs/operators';
import { CaptionRepository } from '../../data/caption/caption-repository.service';
import { Proof } from '../../data/proof/proof';
import { ProofRepository } from '../../data/proof/proof-repository.service';
import { SignatureRepository } from '../../data/signature/signature-repository.service';
import { NotificationService } from '../../notification/notification.service';
import { Publisher } from '../publisher';
import { AssetRepository } from './data/asset/asset-repository.service';
import { NumbersStorageApi, TargetProvider } from './numbers-storage-api.service';

export class NumbersStoragePublisher extends Publisher {

  static readonly ID = 'Numbers Storage';

  readonly id = NumbersStoragePublisher.ID;

  constructor(
    translocoService: TranslocoService,
    notificationService: NotificationService,
    private readonly proofRepository: ProofRepository,
    private readonly signatureRepository: SignatureRepository,
    private readonly captionRepository: CaptionRepository,
    private readonly numbersStorageApi: NumbersStorageApi,
    private readonly assetRepository: AssetRepository
  ) {
    super(translocoService, notificationService);
  }

  isEnabled$() {
    return this.numbersStorageApi.isEnabled$();
  }

  run$(proof: Proof): Observable<void> {
    return zip(
      this.proofRepository.getRawFile$(proof),
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
      tap(v => console.log(v)),
      concatMap(asset => this.assetRepository.add$(asset)),
      mapTo(void 0)
    );
  }
}
