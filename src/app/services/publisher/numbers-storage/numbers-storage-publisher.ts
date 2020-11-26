import { TranslocoService } from '@ngneat/transloco';
import { NotificationService } from '../../notification/notification.service';
import { getOldSignatures } from '../../repositories/proof/old-proof-adapter';
import { Proof } from '../../repositories/proof/proof';
import { Publisher } from '../publisher';
import {
  NumbersStorageApi,
  TargetProvider,
} from './numbers-storage-api.service';
import { AssetRepository } from './repositories/asset/asset-repository.service';

export class NumbersStoragePublisher extends Publisher {
  readonly id = NumbersStoragePublisher.ID;

  constructor(
    translocoService: TranslocoService,
    notificationService: NotificationService,
    private readonly numbersStorageApi: NumbersStorageApi,
    private readonly assetRepository: AssetRepository
  ) {
    super(translocoService, notificationService);
  }

  // TODO: Avoid using static method after refactor preference utils.
  // tslint:disable-next-line: prefer-function-over-method
  isEnabled$() {
    return NumbersStorageApi.isEnabled$();
  }

  async run(proof: Proof) {
    const oldSignatures = await getOldSignatures(proof);
    const assetResponse = await this.numbersStorageApi
      .createAsset$(
        `data:${Object.values(proof.assets)[0].mimeType};base64,${
          Object.keys(proof.assets)[0]
        }`,
        proof,
        TargetProvider.Numbers,
        '',
        oldSignatures,
        'capture-lite'
      )
      .toPromise();
    await this.assetRepository.add(assetResponse);
    return proof;
  }

  static readonly ID = 'Numbers Storage';
}
