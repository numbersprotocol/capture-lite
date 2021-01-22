import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
import {
  DiaBackendAsset,
  DiaBackendAssetRepository,
} from '../dia-backend/asset/dia-backend-asset-repository.service';
import { PreferenceManager } from '../preference-manager/preference-manager.service';
import { getOldProof } from '../repositories/proof/old-proof-adapter';
import { ProofRepository } from '../repositories/proof/proof-repository.service';

const { Device } = Plugins;

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
    if (!(await this.preferences.getBoolean(PrefKeys.TO_0_15_0, false))) {
      await this.to0_15_0();
    }

    return this.updatePreviousVersion();
  }

  private async updatePreviousVersion() {
    const { appVersion } = await Device.getInfo();
    return this.preferences.setString(PrefKeys.PREVIOUS_VERSION, appVersion);
  }

  private async to0_15_0() {
    console.info('Migrate: to 0.15.0');
    // remove local PostCaptures
    const allNotOriginallyOwnedDiaBackendAssets = await this.fetchAllNotOriginallyOwned();

    const allProofs = await this.proofRepository.getAll();
    const localPostCaptures = allProofs.filter(proof =>
      allNotOriginallyOwnedDiaBackendAssets
        .map(asset => asset.proof_hash)
        .includes(getOldProof(proof).hash)
    );
    await Promise.all(
      localPostCaptures.map(async postCapture =>
        this.proofRepository.remove(postCapture)
      )
    );
    await this.preferences.setBoolean(PrefKeys.TO_0_15_0, true);
    // remove diaBackendAssetRepository database
    // table.drop()
  }

  private async fetchAllNotOriginallyOwned() {
    let currentOffset = 0;
    const limit = 100;
    const ret: DiaBackendAsset[] = [];
    while (true) {
      const {
        results: diaBackendAssets,
      } = await this.diaBackendAssetRepository
        .fetchAllNotOriginallyOwned$(currentOffset, limit)
        .toPromise();

      if (diaBackendAssets.length === 0) {
        break;
      }
      ret.push(...diaBackendAssets);
      currentOffset += diaBackendAssets.length;
    }
    return ret;
  }
}

const enum PrefKeys {
  TO_0_15_0 = 'TO_0_15_0',
  PREVIOUS_VERSION = 'PREVIOUS_VERSION',
}
