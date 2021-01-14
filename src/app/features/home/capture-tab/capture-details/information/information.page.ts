import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { getOldProof } from '../../../../../shared/services/repositories/proof/old-proof-adapter';
import { ProofRepository } from '../../../../../shared/services/repositories/proof/proof-repository.service';
import { isNonNullable } from '../../../../../utils/rx-operators/rx-operators';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-information',
  templateUrl: './information.page.html',
  styleUrls: ['./information.page.scss'],
})
export class InformationPage {
  readonly proof$ = this.route.paramMap.pipe(
    map(params => params.get('oldProofHash')),
    isNonNullable(),
    switchMap(async oldProofHash => {
      const all = await this.proofRepository.getAll();
      return all.find(proof => getOldProof(proof).hash === oldProofHash);
    }),
    isNonNullable(),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  readonly timestamp$ = this.proof$.pipe(map(proof => proof?.timestamp));
  readonly oldProofHash$ = this.proof$.pipe(
    map(proof => getOldProof(proof).hash)
  );
  readonly mimeType$ = this.proof$.pipe(
    map(proof => Object.values(proof.indexedAssets)[0].mimeType)
  );
  readonly facts$ = this.proof$.pipe(
    map(proof => Object.values(proof.truth.providers)[0])
  );
  readonly signature$ = this.proof$.pipe(
    map(proof => Object.values(proof.signatures)[0])
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly proofRepository: ProofRepository
  ) {}
}
