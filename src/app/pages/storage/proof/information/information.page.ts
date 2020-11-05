import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy } from '@ngneat/until-destroy';
import { map, switchMap } from 'rxjs/operators';
import { InformationType } from 'src/app/services/data/information/information';
import { InformationRepository } from 'src/app/services/data/information/information-repository.service';
import { ProofRepository } from 'src/app/services/data/proof/proof-repository.service';
import { isNonNullable } from 'src/app/utils/rx-operators';

const { Clipboard } = Plugins;

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

  constructor(
    private readonly route: ActivatedRoute,
    private readonly proofRepository: ProofRepository,
    private readonly informationRepository: InformationRepository,
    private readonly translocoService: TranslocoService,
    private readonly snackBar: MatSnackBar,
  ) { }

  copyToClipboard(value: string) {
    Clipboard.write({ string: value });
    this.snackBar.open(this.translocoService.translate('message.copiedToClipboard'));
  }
}
