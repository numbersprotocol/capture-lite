import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, map, switchMap } from 'rxjs/operators';
import { ProofRepository } from 'src/app/services/data/proof/proof-repository.service';

@Component({
  selector: 'app-proof',
  templateUrl: './proof.page.html',
  styleUrls: ['./proof.page.scss'],
})
export class ProofPage {

  readonly hash$ = this.route.paramMap.pipe(map(params => params.get('hash')));
  readonly rawBase64$ = this.hash$.pipe(
    filter(hash => !!hash),
    switchMap(hash => this.proofRepository.getRawFile$(hash))
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly proofRepository: ProofRepository
  ) { }
}
