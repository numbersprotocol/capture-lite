import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { map, pluck, switchMap } from 'rxjs/operators';
import { WebCryptoApiProvider } from 'src/app/services/collector/signature/web-crypto-api-provider/web-crypto-api-provider';
import { InformationType } from 'src/app/services/data/information/information';
import { InformationRepository } from 'src/app/services/data/information/information-repository.service';
import { ProofRepository } from 'src/app/services/data/proof/proof-repository.service';
import { SignatureRepository } from 'src/app/services/data/signature/signature-repository.service';
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

  readonly timestamp$ = this.proof$.pipe(pluck('timestamp'));
  readonly hash$ = this.proof$.pipe(pluck('hash'));
  readonly mimeType$ = this.proof$.pipe(pluck('mimeType'));

  readonly locationInformation$ = this.proof$.pipe(
    switchMap(proof => this.informationRepository.getByProof$(proof)),
    map(informationList => informationList.filter(information => information.type === InformationType.Location))
  );

  readonly deviceInformation$ = this.proof$.pipe(
    switchMap(proof => this.informationRepository.getByProof$(proof)),
    map(informationList => informationList.filter(information => information.type === InformationType.Device))
  );

  readonly otherInformation$ = this.proof$.pipe(
    switchMap(proof => this.informationRepository.getByProof$(proof)),
    map(informationList => informationList.filter(information => information.type === InformationType.Other))
  );

  readonly signature$ = this.proof$.pipe(
    switchMap(proof => this.signatureRepository.getByProof$(proof)),
    map(signatures => signatures.find(signature => signature.provider === WebCryptoApiProvider.ID)),
    isNonNullable()
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly proofRepository: ProofRepository,
    private readonly informationRepository: InformationRepository,
    private readonly signatureRepository: SignatureRepository
  ) { }
}
