import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { map, pluck, switchMap, switchMapTo } from 'rxjs/operators';
import { InformationType } from 'src/app/services/data/information/information';
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

    readonly hash$ = this.proof$.pipe(pluck('hash'));

    readonly locationInformation$ = this.proof$.pipe(
        switchMap(proof => this.informationRepository.getByProof$(proof)),
        map(informationList => informationList.filter(information => information.type === InformationType.Location))
    );

    readonly otherInformation$ = this.proof$.pipe(
        switchMap(proof => this.informationRepository.getByProof$(proof)),
        map(informationList => informationList.filter(information => information.type === InformationType.Other))
    );

    readonly deviceInformation$ = this.proof$.pipe(
        switchMap(proof => this.informationRepository.getByProof$(proof)),
        map(informationList => informationList.filter(information => information.type === InformationType.Device))
    );

    constructor(
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
