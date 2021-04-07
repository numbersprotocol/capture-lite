import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Plugins } from '@capacitor/core';
import { defer } from 'rxjs';
import { concatMap, first, pluck } from 'rxjs/operators';
import { VOID$ } from '../../../utils/rx-operators/rx-operators';
import { MigratingDialogComponent } from '../../components/migrating-dialog/migrating-dialog.component';
import {
  DiaBackendAsset,
  DiaBackendAssetRepository,
} from '../dia-backend/asset/dia-backend-asset-repository.service';
import { NetworkService } from '../network/network.service';
import { OnboardingService } from '../onboarding/onboarding.service';
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
    private readonly dialog: MatDialog,
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository,
    private readonly networkService: NetworkService,
    private readonly proofRepository: ProofRepository,
    private readonly preferenceManager: PreferenceManager,
    private readonly onboardingService: OnboardingService
  ) {}

  migrate$(skip?: boolean) {
    const runMigrate$ = defer(() => this.preMigrate(skip)).pipe(
      concatMap(() => this.runMigrateTo0_15_0WithProgressDialog(skip)),
      concatMap(() => this.postMigrateTo0_15_0())
    );
    return defer(() =>
      this.preferences.getBoolean(PrefKeys.TO_0_15_0, false)
    ).pipe(concatMap(hasMigrated => (hasMigrated ? VOID$ : runMigrate$)));
  }

  private async preMigrate(skip?: boolean) {
    if (
      !skip &&
      !(await this.onboardingService.hasPrefetchedDiaBackendAssets())
    ) {
      await this.onboardingService.setHasPrefetchedDiaBackendAssets(true);
    }
  }

  private async postMigrateTo0_15_0() {
    await this.preferences.setBoolean(PrefKeys.TO_0_15_0, true);
    await this.updatePreviousVersion();
  }

  private async runMigrateTo0_15_0WithProgressDialog(skip?: boolean) {
    if (skip) {
      return;
    }
    if (!(await this.networkService.connected$.pipe(first()).toPromise())) {
      throw new Error('No network connection, aborting migration.');
    }
    const dialogRef = this.dialog.open(MigratingDialogComponent, {
      disableClose: true,
      data: { progress: 0 },
    });

    try {
      await this.to0_15_0();
      await this.onboardingService.setHasPrefetchedDiaBackendAssets(true);
    } finally {
      dialogRef.close();
    }
  }

  async updatePreviousVersion() {
    const { appVersion } = await Device.getInfo();
    return this.preferences.setString(PrefKeys.PREVIOUS_VERSION, appVersion);
  }

  private async to0_15_0() {
    await this.fetchAndUpdateDiaBackendAssetId();
    await this.removeLocalPostCaptures();
  }

  private async fetchAndUpdateDiaBackendAssetId() {
    const allOriginallyOwnedDiaBackendAssets = await this.fetchAllOriginallyOwned();
    const allProofs = await this.proofRepository.getAll();
    const proofsToBeUpdated = allProofs
      .filter(proof => !proof.diaBackendAssetId)
      .map(proof => {
        proof.diaBackendAssetId = allOriginallyOwnedDiaBackendAssets.find(
          asset => asset.proof_hash === getOldProof(proof).hash
        )?.id;
        return proof;
      })
      .filter(proof => !!proof.diaBackendAssetId);
    await this.proofRepository.update(
      proofsToBeUpdated,
      (x, y) => getOldProof(x).hash === getOldProof(y).hash
    );
  }

  private async fetchAllOriginallyOwned() {
    let currentOffset = 0;
    const limit = 100;
    const ret: DiaBackendAsset[] = [];
    while (true) {
      const {
        results: diaBackendAssets,
      } = await this.diaBackendAssetRepository
        .fetchCaptures$({ offset: currentOffset, limit })
        .toPromise();
      if (diaBackendAssets.length === 0) {
        break;
      }
      ret.push(...diaBackendAssets);
      currentOffset += diaBackendAssets.length;
    }
    return ret;
  }

  private async removeLocalPostCaptures() {
    const postCaptures = await this.fetchAllPostCaptures();

    const allProofs = await this.proofRepository.getAll();
    const localPostCaptures = allProofs.filter(proof =>
      postCaptures
        .map(asset => asset.proof_hash)
        .includes(getOldProof(proof).hash)
    );
    await Promise.all(
      localPostCaptures.map(async postCapture =>
        this.proofRepository.remove(postCapture)
      )
    );
  }

  private async fetchAllPostCaptures() {
    return this.diaBackendAssetRepository.postCaptures$
      .pipe(first(), pluck('results'))
      .toPromise();
  }
}

const enum PrefKeys {
  TO_0_15_0 = 'TO_0_15_0',
  PREVIOUS_VERSION = 'PREVIOUS_VERSION',
}
