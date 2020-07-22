import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter, map, switchMap, switchMapTo } from 'rxjs/operators';
import { InformationRepository } from 'src/app/services/data/information/information-repository.service';
import { ProofRepository } from 'src/app/services/data/proof/proof-repository.service';
import { SignatureRepository } from 'src/app/services/data/signature/signature-repository.service';

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
  readonly providersWithInformationList$ = this.proof$.pipe(
    switchMap(proof => this.informationRepository.getByProof$(proof)),
    map(informationList => {
      const providers = new Set(informationList.map(information => information.provider));
      return [...providers].map(provider => ({
        provider,
        informationList: informationList.filter(information => information.provider === provider)
      }));
    })
  );
  readonly signatures$ = this.proof$.pipe(
    switchMap(proof => this.signatureRepository.getByProof$(proof))
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly proofRepository: ProofRepository,
    private readonly informationRepository: InformationRepository,
    private readonly signatureRepository: SignatureRepository
  ) { }

  ngOnInit() {
    this.proofRepository.refresh$().pipe(
      switchMapTo(this.informationRepository.refresh$()),
      switchMapTo(this.signatureRepository.refresh$()),
      untilDestroyed(this)
    ).subscribe();
  }
}
