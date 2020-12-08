import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { combineLatest } from 'rxjs';
import { concatMap, map, switchMap } from 'rxjs/operators';
import { DiaBackendAssetRepository } from '../../../../services/dia-backend/asset/dia-backend-asset-repository.service';
import {
  getOldProof,
  getOldSignatures,
} from '../../../../services/repositories/proof/old-proof-adapter';
import { ProofRepository } from '../../../../services/repositories/proof/proof-repository.service';
import { isNonNullable } from '../../../../utils/rx-operators';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-information',
  templateUrl: './information.page.html',
  styleUrls: ['./information.page.scss'],
})
export class InformationPage {
  readonly asset$ = this.route.paramMap.pipe(
    map(params => params.get('id')),
    isNonNullable(),
    switchMap(id => this.diaBackendAssetRepository.getById$(id)),
    isNonNullable()
  );
  private readonly proofsWithOld$ = this.proofRepository
    .getAll$()
    .pipe(
      map(proofs =>
        proofs.map(proof => ({ proof, oldProof: getOldProof(proof) }))
      )
    );
  readonly capture$ = combineLatest([this.asset$, this.proofsWithOld$]).pipe(
    map(([asset, proofsWithThumbnailAndOld]) => ({
      asset,
      proofWithOld: proofsWithThumbnailAndOld.find(
        p => p.oldProof.hash === asset.proof_hash
      ),
    }))
  );
  readonly timestamp$ = this.capture$.pipe(
    map(capture => capture.proofWithOld?.proof.timestamp)
  );
  readonly hash$ = this.capture$.pipe(
    map(capture => capture.proofWithOld),
    isNonNullable(),
    concatMap(proofWithOld => proofWithOld.proof.getId())
  );
  readonly mimeType$ = this.capture$.pipe(
    map(capture => capture.proofWithOld),
    isNonNullable(),
    map(
      proofWithOld =>
        Object.values(proofWithOld.proof.indexedAssets)[0].mimeType
    )
  );

  readonly facts$ = this.capture$.pipe(
    map(capture => capture.proofWithOld),
    isNonNullable(),
    map(proofWithOld => Object.values(proofWithOld.proof.truth.providers)[0])
  );

  readonly signature$ = this.capture$.pipe(
    map(capture => capture.proofWithOld),
    isNonNullable(),
    map(proofWithOld => getOldSignatures(proofWithOld.proof)[0])
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository,
    private readonly proofRepository: ProofRepository
  ) {}
}
