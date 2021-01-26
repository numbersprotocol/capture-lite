import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Plugins } from '@capacitor/core';
import { BehaviorSubject, defer } from 'rxjs';
import { concatMap, distinctUntilChanged, tap } from 'rxjs/operators';
import { switchTapTo, VOID$ } from '../../../utils/rx-operators/rx-operators';
import { MigratingDialogComponent } from '../../core/migrating-dialog/migrating-dialog.component';
import {
  DiaBackendAsset,
  DiaBackendAssetRepository,
} from '../dia-backend/asset/dia-backend-asset-repository.service';
import { OnboardingService } from '../onboarding/onboarding.service';
import { PreferenceManager } from '../preference-manager/preference-manager.service';
import { getOldProof } from '../repositories/proof/old-proof-adapter';
import { ProofRepository } from '../repositories/proof/proof-repository.service';

const { Device } = Plugins;

@Injectable({
  providedIn: 'root',
})
export class MigrationService {
  private readonly _hasMigrated$ = new BehaviorSubject(false);
  readonly hasMigrated$ = this._hasMigrated$
    .asObservable()
    .pipe(distinctUntilChanged());
  private readonly preferences = this.preferenceManager.getPreferences(
    MigrationService.name
  );

  constructor(
    private readonly dialog: MatDialog,
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository,
    private readonly proofRepository: ProofRepository,
    private readonly preferenceManager: PreferenceManager,
    private readonly onboardingService: OnboardingService
  ) {}

  migrate$(skip?: boolean) {
    const runMigrate$ = defer(() =>
      this.runMigrateWithProgressDialog(skip)
    ).pipe(
      concatMap(() => this.preferences.setBoolean(PrefKeys.TO_0_15_0, true)),
      concatMap(() => this.updatePreviousVersion()),
      switchTapTo(
        defer(() =>
          this.onboardingService.setHasPrefetchedDiaBackendAssets(true)
        )
      )
    );
    return defer(() =>
      this.preferences.getBoolean(PrefKeys.TO_0_15_0, false)
    ).pipe(
      concatMap(hasMigrated => (hasMigrated ? VOID$ : runMigrate$)),
      tap(() => this._hasMigrated$.next(true))
    );
  }

  private async runMigrateWithProgressDialog(skip?: boolean) {
    if (skip) {
      return;
    }
    const dialogRef = this.dialog.open(MigratingDialogComponent, {
      disableClose: true,
      data: { progress: 0 },
    });

    return this.to0_15_0().then(() => dialogRef.close());
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

  private async removeLocalPostCaptures() {
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
  }

  private async fetchAllOriginallyOwned() {
    let currentOffset = 0;
    const limit = 100;
    const ret: DiaBackendAsset[] = [];
    while (true) {
      const {
        results: diaBackendAssets,
      } = await this.diaBackendAssetRepository
        .fetchAllOriginallyOwned$(currentOffset, limit)
        .toPromise();

      if (diaBackendAssets.length === 0) {
        break;
      }
      ret.push(...diaBackendAssets);
      currentOffset += diaBackendAssets.length;
    }
    return ret;
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
