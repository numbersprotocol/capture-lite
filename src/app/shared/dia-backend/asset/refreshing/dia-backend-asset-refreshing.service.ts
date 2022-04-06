import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { EMPTY, forkJoin, of } from 'rxjs';
import { catchError, concatMap, first } from 'rxjs/operators';
import { HttpErrorCode } from '../../../error/error.service';
import { ProofRepository } from '../../../repositories/proof/proof-repository.service';
import { DiaBackendAssetRepository } from '../dia-backend-asset-repository.service';
import { DiaBackendAssetPrefetchingService } from '../prefetching/dia-backend-asset-prefetching.service';
import { DiaBackendAssetUploadingService } from '../uploading/dia-backend-asset-uploading.service';

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class DiaBackendAsseRefreshingService {
  private pendingUploadTasks = 0;

  constructor(
    private readonly assetRepository: DiaBackendAssetRepository,
    private readonly proofRepository: ProofRepository,
    private readonly diaBackendAssetPrefetchingService: DiaBackendAssetPrefetchingService,
    private readonly uploadService: DiaBackendAssetUploadingService
  ) {
    this.uploadService.pendingTasks$
      .pipe(untilDestroyed(this))
      .subscribe(value => (this.pendingUploadTasks = value));
  }

  refresh$() {
    // Don't refresh if there are still captures being uploaded.
    if (this.pendingUploadTasks > 0) {
      return EMPTY;
    }

    return this.proofRepository.all$.pipe(
      first(),
      // Remove deleted Captures or Captures that no longer belong to the user.
      concatMap(proofs => {
        if (proofs.length === 0) return of([]);
        return forkJoin(
          proofs.map(proof =>
            this.assetRepository.fetchByProof$(proof).pipe(
              catchError((err: unknown) => {
                if (
                  err instanceof HttpErrorResponse &&
                  err.status === HttpErrorCode.NOT_FOUND
                ) {
                  this.proofRepository.remove(proof);
                }
                return EMPTY;
              })
            )
          )
        );
      }),
      concatMap(async () => {
        // TO DO: pass in diaBackendAssets and skip those when prefetching.
        await this.diaBackendAssetPrefetchingService.prefetch();
        return EMPTY;
      })
    );
  }
}
