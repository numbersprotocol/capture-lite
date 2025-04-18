import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CameraSource } from '@capacitor/camera';
import { defer, forkJoin, iif } from 'rxjs';
import {
  catchError,
  concatMap,
  defaultIfEmpty,
  first,
  map,
  pluck,
} from 'rxjs/operators';
import { VOID$ } from '../../../utils/rx-operators/rx-operators';
import { CollectorService } from '../../collector/collector.service';
import { CaptureAppWebCryptoApiSignatureProvider } from '../../collector/signature/capture-app-web-crypto-api-signature-provider/capture-app-web-crypto-api-signature-provider.service';
import {
  DiaBackendAsset,
  DiaBackendAssetRepository,
} from '../../dia-backend/asset/dia-backend-asset-repository.service';
import { DiaBackendAssetPrefetchingService } from '../../dia-backend/asset/prefetching/dia-backend-asset-prefetching.service';
import { DiaBackendWalletService } from '../../dia-backend/wallet/dia-backend-wallet.service';
import { HttpErrorCode } from '../../error/error.service';
import { NetworkService } from '../../network/network.service';
import { OnboardingService } from '../../onboarding/onboarding.service';
import { PreferenceManager } from '../../preference-manager/preference-manager.service';
import { getOldProof } from '../../repositories/proof/old-proof-adapter';
import { ProofRepository } from '../../repositories/proof/proof-repository.service';
import { VersionService } from '../../version/version.service';
import { MigratingDialogComponent } from '../migrating-dialog/migrating-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class MigrationService {
  private readonly preferences =
    this.preferenceManager.getPreferences('MigrationService');

  constructor(
    private readonly collectorService: CollectorService,
    private readonly dialog: MatDialog,
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository,
    private readonly diaBackendWalletService: DiaBackendWalletService,
    private readonly diaBackendAssetPrefetchingService: DiaBackendAssetPrefetchingService,
    private readonly networkService: NetworkService,
    private readonly proofRepository: ProofRepository,
    private readonly preferenceManager: PreferenceManager,
    private readonly onboardingService: OnboardingService,
    private readonly versionService: VersionService,
    private readonly capAppWebCryptoApiSignatureProvider: CaptureAppWebCryptoApiSignatureProvider
  ) {}

  migrate$(skip?: boolean) {
    const runMigrateTo0_15_0$ = defer(() => this.preMigrateTo0_15_0(skip)).pipe(
      concatMap(() => this.runMigrateTo0_15_0WithProgressDialog(skip)),
      concatMap(() => this.postMigrateTo0_15_0())
    );
    return defer(() =>
      this.preferences.getBoolean(PrefKeys.TO_0_15_0, false)
    ).pipe(
      concatMap(hasMigratedTo0_15_0 =>
        hasMigratedTo0_15_0 ? VOID$ : runMigrateTo0_15_0$
      ),
      concatMap(() => this.runMigrateFrom0_38_1$()),
      concatMap(() => this.runMigrateFrom0_40_2$()),
      concatMap(() => this.updatePreviousVersion())
    );
  }

  private async preMigrateTo0_15_0(skip?: boolean) {
    if (
      !skip &&
      !(await this.onboardingService.hasPrefetchedDiaBackendAssets())
    ) {
      await this.onboardingService.setHasPrefetchedDiaBackendAssets(true);
    }
  }

  private async postMigrateTo0_15_0() {
    await this.preferences.setBoolean(PrefKeys.TO_0_15_0, true);
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

  runMigrateFrom0_38_1$() {
    const targetVersion = '0.38.1';
    return this.preferences.getString$(PrefKeys.PREVIOUS_VERSION).pipe(
      first(),
      concatMap(previousVersion =>
        iif(
          () => isEqualOrLowerThanTargetVersion(previousVersion, targetVersion),
          this.migrationActions0_38_1$(),
          VOID$
        )
      )
    );
  }

  migrationActions0_38_1$() {
    return this.createOrImportDiaBackendIntegrityWallet$().pipe(
      concatMap(() => this.generateAndUpdateSignatureForUnversionedProofs$())
    );
  }

  runMigrateFrom0_40_2$() {
    const targetVersion = '0.42.0';
    return this.preferences.getString$(PrefKeys.PREVIOUS_VERSION).pipe(
      first(),
      concatMap(previousVersion =>
        iif(
          () => isEqualOrLowerThanTargetVersion(previousVersion, targetVersion),
          this.migrationActions0_40_2$(),
          VOID$
        )
      )
    );
  }

  migrationActions0_40_2$() {
    return defer(async () => {
      const dialogRef = this.dialog.open(MigratingDialogComponent, {
        disableClose: true,
        data: { progress: 0 },
      });

      try {
        await this.diaBackendAssetPrefetchingService.prefetch();
      } finally {
        dialogRef.close();
      }
    });
  }

  createOrImportDiaBackendIntegrityWallet$() {
    /**
     * Deal with backend's asset wallet with the following logic:
     * 1. If backend asset wallet already exists, replace App's keys with asset wallet's keys.
     * 2. If not, upload App's keys to create an asset wallet.
     */
    return this.diaBackendWalletService.getIntegrityWallet$().pipe(
      catchError((err: unknown) => {
        if (
          err instanceof HttpErrorResponse &&
          err.status === HttpErrorCode.NOT_FOUND
        ) {
          return defer(() =>
            this.capAppWebCryptoApiSignatureProvider.getPrivateKey()
          ).pipe(
            concatMap(privateKey =>
              this.diaBackendWalletService.setIntegrityWallet$(privateKey)
            )
          );
        }
        throw err;
      }),
      concatMap(assetWallet =>
        this.capAppWebCryptoApiSignatureProvider.importKeys(
          assetWallet.address,
          assetWallet.private_key
        )
      )
    );
  }

  generateAndUpdateSignatureForUnversionedProofs$() {
    return this.proofRepository.all$.pipe(
      first(),
      map(proofs => proofs.filter(proof => !proof.signatureVersion)),
      concatMap(proofs =>
        forkJoin(
          proofs.map(proof =>
            this.collectorService.generateSignature(proof, CameraSource.Camera)
          )
        ).pipe(defaultIfEmpty(proofs))
      ),
      concatMap(proofs =>
        forkJoin(
          proofs.map(proof =>
            this.diaBackendAssetRepository.updateCaptureSignature$(proof)
          )
        ).pipe(
          defaultIfEmpty(),
          concatMap(() =>
            this.proofRepository.update(
              proofs,
              (x, y) => getOldProof(x).hash === getOldProof(y).hash
            )
          )
        )
      )
    );
  }

  async updatePreviousVersion() {
    return this.preferences.setString(
      PrefKeys.PREVIOUS_VERSION,
      await this.versionService.version$.pipe(first()).toPromise()
    );
  }

  private async to0_15_0() {
    await this.fetchAndUpdateDiaBackendAssetId();
    await this.removeLocalPostCaptures();
  }

  private async fetchAndUpdateDiaBackendAssetId() {
    const allOriginallyOwnedDiaBackendAssets =
      await this.fetchAllOriginallyOwned();
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
      const { results: diaBackendAssets } = await this.diaBackendAssetRepository
        .fetchOriginallyOwned$({ offset: currentOffset, limit })
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

function isEqualOrLowerThanTargetVersion(
  currentVersion: string | undefined,
  targetVersion: string
) {
  if (!currentVersion) return false;
  const currentVersionArray = currentVersion.split('.').map(Number);
  const targetVersionArray = targetVersion.split('.').map(Number);
  for (const index in currentVersionArray) {
    if (currentVersionArray[index] > targetVersionArray[index]) {
      return false;
    } else if (currentVersionArray[index] < targetVersionArray[index]) {
      return true;
    }
  }
  return true;
}
