import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, forkJoin } from 'rxjs';
import { catchError, concatMap, first } from 'rxjs/operators';
import { HttpErrorCode } from '../../../error/error.service';
import { ProofRepository } from '../../../repositories/proof/proof-repository.service';
import { DiaBackendAssetRepository } from '../dia-backend-asset-repository.service';
import { DiaBackendAssetPrefetchingService } from '../prefetching/dia-backend-asset-prefetching.service';

@Injectable({
  providedIn: 'root',
})
export class DiaBackendAsseRefreshingService {
  constructor(
    private readonly assetRepository: DiaBackendAssetRepository,
    private readonly proofRepository: ProofRepository,
    private readonly diaBackendAssetPrefetchingService: DiaBackendAssetPrefetchingService
  ) {}

  refresh() {
    return this.proofRepository.all$.pipe(
      first(),
      concatMap(proofs =>
        forkJoin(
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
        )
      ),
      concatMap(() => this.diaBackendAssetPrefetchingService.prefetch())
    );
  }
}
