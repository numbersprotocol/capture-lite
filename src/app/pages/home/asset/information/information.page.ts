import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { combineLatest } from 'rxjs';
import { concatMap, map, switchMap } from 'rxjs/operators';
import { AssetRepository } from 'src/app/services/publisher/numbers-storage/data/asset/asset-repository.service';
import { getOldProof, getOldSignatures } from 'src/app/services/repositories/proof/old-proof-adapter';
import { ProofRepository } from 'src/app/services/repositories/proof/proof-repository.service';
import { isNonNullable } from 'src/app/utils/rx-operators';

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
    switchMap(id => this.assetRepository.getById$(id)),
    isNonNullable()
  );
  private readonly proofsWithOld$ = this.proofRepository.getAll$().pipe(
    concatMap(proofs => Promise.all(proofs.map(async (proof) =>
      ({ proof, oldProof: await getOldProof(proof) })
    )))
  );
  readonly capture$ = combineLatest([this.asset$, this.proofsWithOld$]).pipe(
    map(([asset, proofsWithThumbnailAndOld]) => ({
      asset,
      proofWithOld: proofsWithThumbnailAndOld.find(p => p.oldProof.hash === asset.proof_hash)
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
    map(proofWithOld => Object.values(proofWithOld.proof.assets)[0].mimeType)
  );

  readonly facts$ = this.capture$.pipe(
    map(capture => capture.proofWithOld),
    isNonNullable(),
    map(proofWithOld => Object.values(proofWithOld.proof.truth.providers)[0])
  );

  readonly signature$ = this.capture$.pipe(
    map(capture => capture.proofWithOld),
    isNonNullable(),
    concatMap(proofWithOld => getOldSignatures(proofWithOld.proof)),
    map(oldSignatures => oldSignatures[0])
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly assetRepository: AssetRepository,
    private readonly proofRepository: ProofRepository
  ) { }
}
