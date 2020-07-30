import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { first, map, switchMap, switchMapTo } from 'rxjs/operators';
import { ConfirmAlert } from 'src/app/services/confirm-alert/confirm-alert.service';
import { CaptionRepository } from 'src/app/services/data/caption/caption-repository.service';
import { InformationRepository } from 'src/app/services/data/information/information-repository.service';
import { ProofRepository } from 'src/app/services/data/proof/proof-repository.service';
import { SignatureRepository } from 'src/app/services/data/signature/signature-repository.service';
import { PublishersAlert } from 'src/app/services/publisher/publishers-alert/publishers-alert.service';
import { isNonNullable } from 'src/app/utils/type';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-proof',
  templateUrl: './proof.page.html',
  styleUrls: ['./proof.page.scss'],
})
export class ProofPage {

  readonly proof$ = this.route.paramMap.pipe(
    map(params => params.get('hash')),
    isNonNullable(),
    switchMap(hash => this.proofRepository.getByHash$(hash)),
    isNonNullable()
  );
  readonly rawBase64$ = this.proof$.pipe(switchMap(proof => this.proofRepository.getRawFile$(proof)));
  readonly hash$ = this.proof$.pipe(map(proof => proof.hash));
  readonly mimeType$ = this.proof$.pipe(map(proof => proof.mimeType.type));
  readonly timestamp$ = this.proof$.pipe(map(proof => new Date(proof.timestamp)));
  readonly caption$ = this.proof$.pipe(
    switchMap(proof => this.captionRepository.getByProof$(proof)),
    map(captions => {
      if (captions.length === 0 || captions[0].text.length === 0) { return ''; }
      return captions[0].text;
    })
  );
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
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly translateService: TranslateService,
    private readonly alertController: AlertController,
    private readonly confirmAlert: ConfirmAlert,
    private readonly publishersAlert: PublishersAlert,
    private readonly proofRepository: ProofRepository,
    private readonly captionRepository: CaptionRepository,
    private readonly informationRepository: InformationRepository,
    private readonly signatureRepository: SignatureRepository
  ) { }

  ionViewWillEnter() {
    this.proofRepository.refresh$().pipe(
      switchMapTo(this.captionRepository.refresh$()),
      switchMapTo(this.informationRepository.refresh$()),
      switchMapTo(this.signatureRepository.refresh$()),
      untilDestroyed(this)
    ).subscribe();
  }

  publish() {
    this.proof$.pipe(
      first(),
      switchMap(proof => this.publishersAlert.present$(proof)),
      untilDestroyed(this)
    ).subscribe();
  }

  remove() {
    const onConfirm = () => this.proof$.pipe(
      switchMap(proof => this.proofRepository.remove$(proof)),
      switchMapTo(this.router.navigate(['..'])),
      untilDestroyed(this)
    ).subscribe();

    return this.confirmAlert.present$(onConfirm).pipe(untilDestroyed(this)).subscribe();
  }

  editCaption() {
    const captionInputName = 'captionInputName';
    this.caption$.pipe(
      first(),
      switchMap(caption => this.alertController.create({
        header: this.translateService.instant('editCaption'),
        inputs: [{
          name: captionInputName,
          type: 'text',
          value: caption,
          placeholder: this.translateService.instant('nothingHere')
        }],
        buttons: [{
          text: this.translateService.instant('cancel'),
          role: 'cancel'
        }, {
          text: this.translateService.instant('ok'),
          handler: (inputs) => this.saveCaption(inputs[captionInputName])
        }]
      })),
      switchMap(alertElement => alertElement.present()),
      untilDestroyed(this)
    ).subscribe();
  }

  private saveCaption(text: string) {
    this.proof$.pipe(
      switchMap(proof => this.captionRepository.addOrEdit$({
        proofHash: proof.hash,
        text
      })),
      untilDestroyed(this)
    ).subscribe();
  }
}
