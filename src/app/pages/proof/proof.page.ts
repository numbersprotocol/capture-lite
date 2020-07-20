import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter, map, switchMap } from 'rxjs/operators';
import { ProofRepository } from 'src/app/services/data/proof/proof-repository.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-proof',
  templateUrl: './proof.page.html',
  styleUrls: ['./proof.page.scss'],
})
export class ProofPage implements OnInit {

  readonly proof$ = this.route.paramMap.pipe(
    map(params => params.get('hash')),
    filter(hash => !!hash),
    switchMap(hash => this.proofRepository.getByHash$(hash))
  );
  readonly rawBase64$ = this.proof$.pipe(switchMap(proof => this.proofRepository.getRawFile$(proof)));
  readonly hash$ = this.proof$.pipe(map(proof => proof.hash));
  readonly mimeType$ = this.proof$.pipe(map(proof => proof.mimeType.type));
  readonly timestamp$ = this.proof$.pipe(map(proof => new Date(proof.timestamp)));

  constructor(
    private readonly route: ActivatedRoute,
    private readonly proofRepository: ProofRepository
  ) { }

  ngOnInit() {
    this.proofRepository.refresh$().pipe(
      untilDestroyed(this)
    ).subscribe();
  }
}
