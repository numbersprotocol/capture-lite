import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { map, switchMap, switchMapTo } from 'rxjs/operators';
import { InformationRepository } from 'src/app/services/data/information/information-repository.service';
import { ProofRepository } from 'src/app/services/data/proof/proof-repository.service';
import { isNonNullable } from 'src/app/utils/rx-operators';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-information',
  templateUrl: './information.page.html',
  styleUrls: ['./information.page.scss'],
})
export class InformationPage {

  readonly proof$ = this.route.paramMap.pipe(
    map(params => params.get('hash')),
    isNonNullable(),
    switchMap(hash => this.proofRepository.getByHash$(hash)),
    isNonNullable()
  );

  readonly hash$ = this.proof$.pipe(map(proof => proof.hash));

  readonly locationInformation$ = this.proof$.pipe(
    switchMap(proof => this.informationRepository.getByProof$(proof)),
    map(informationList => {
      const types = new Array(informationList.map(information => information.type));
      return [...types].map(type => ({
        type,
        informationList: informationList.filter(information => information.type === 1)
      }));
    })
  );

  readonly hashInformation$ = this.proof$.pipe(
    switchMap(proof => this.informationRepository.getByProof$(proof)),
    map(informationList => {
      const types = new Array(informationList.map(information => information.type));
      return [...types].map(type => ({
        type,
        informationList: informationList.filter(information => information.type === 2)
      }));
    })
  );

  readonly otherInformation$ = this.proof$.pipe(
    switchMap(proof => this.informationRepository.getByProof$(proof)),
    map(informationList => {
      const types = new Array(informationList.map(information => information.type));
      return [...types].map(type => ({
        type,
        informationList: informationList.filter(information => information.type === 0)
      }));
    })
  );

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly proofRepository: ProofRepository,
    private readonly informationRepository: InformationRepository,
  ) { }

  ionViewWillEnter() {
    this.proofRepository.refresh$().pipe(
      switchMapTo(this.informationRepository.refresh$()),
      untilDestroyed(this)
    ).subscribe();
  }
}
