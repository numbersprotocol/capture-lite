import { Injectable } from '@angular/core';
import {
  DiaBackendAsset,
  DiaBackendAssetRepository,
} from '../dia-backend/asset/dia-backend-asset-repository.service';
import { PreferenceManager } from '../preference-manager/preference-manager.service';
import { getOldProof } from '../repositories/proof/old-proof-adapter';
import { ProofRepository } from '../repositories/proof/proof-repository.service';

@Injectable({
  providedIn: 'root',
})
export class MigrationService {
  private readonly preferences = this.preferenceManager.getPreferences(
    MigrationService.name
  );

  constructor(
    private readonly proofRepository: ProofRepository,
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository,
    private readonly preferenceManager: PreferenceManager
  ) {}

  async migrate() {
    if (
      await this.preferences.getBoolean(PrefKeys.FROM_0_12_0_TO_0_15_0, false)
    ) {
      await this.from0_12_0To0_15_0();
    }
  }

  private async from0_12_0To0_15_0() {
    // remove local PostCaptures
    const allNotOriginallyOwnedDiaBackendAssets = await this.fetchAllNotOriginallyOwned();
    console.log(`allDiaBackendAssets:`, allNotOriginallyOwnedDiaBackendAssets);

    const allProofs = await this.proofRepository.getAll();
    const localPostCaptures = allProofs.filter(proof =>
      allNotOriginallyOwnedDiaBackendAssets
        .map(asset => asset.proof_hash)
        .includes(getOldProof(proof).hash)
    );
    console.log(`localPostCaptures`, localPostCaptures);
    await Promise.all(
      localPostCaptures.map(async postCapture =>
        this.proofRepository.remove(postCapture)
      )
    );
    // remove diaBackendAssetRepository database
    // table.drop()
  }

  private async fetchAllNotOriginallyOwned() {
    const currentOffset = 0;
    const limit = 100;
    const ret: DiaBackendAsset[] = [];
    while (true) {
      const {
        results: diaBackendAssets,
      } = await this.diaBackendAssetRepository
        .fetchAllNotOriginallyOwned$()
        .toPromise();

      if (diaBackendAssets.length === 0) {
        break;
      }
      ret.push(...diaBackendAssets);
    }
    return ret;
  }
}

const enum PrefKeys {
  FROM_0_12_0_TO_0_15_0 = 'FROM_0_12_0_TO_0_15_0',
}
