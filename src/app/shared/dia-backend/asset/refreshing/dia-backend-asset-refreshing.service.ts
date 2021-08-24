import { Injectable } from '@angular/core';
import { EMPTY, forkJoin, from } from 'rxjs';
import { catchError, concatMap, first } from 'rxjs/operators';
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
      concatMap(async proofs =>
        forkJoin(
          proofs.map(async proof =>
            this.assetRepository
              .fetchByProof$(proof)
              .pipe(
                catchError(async () => {
                  await this.proofRepository.remove(proof);
                  return EMPTY;
                })
              )
              .subscribe()
          )
        )
      ),
      concatMap(() => from(this.diaBackendAssetPrefetchingService.prefetch()))
    );
  }
}
