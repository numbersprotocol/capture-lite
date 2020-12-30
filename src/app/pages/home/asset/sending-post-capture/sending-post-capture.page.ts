import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { defer, zip } from 'rxjs';
import {
  concatMap,
  concatMapTo,
  first,
  map,
  share,
  switchMap,
} from 'rxjs/operators';
import { BlockingActionService } from '../../../../services/blocking-action/blocking-action.service';
import { ConfirmAlert } from '../../../../services/confirm-alert/confirm-alert.service';
import { DiaBackendAssetRepository } from '../../../../services/dia-backend/asset/dia-backend-asset-repository.service';
import { DiaBackendTransactionRepository } from '../../../../services/dia-backend/transaction/dia-backend-transaction-repository.service';
import { getOldProof } from '../../../../services/repositories/proof/old-proof-adapter';
import { ProofRepository } from '../../../../services/repositories/proof/proof-repository.service';
import { isNonNullable } from '../../../../utils/rx-operators/rx-operators';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-sending-post-capture',
  templateUrl: './sending-post-capture.page.html',
  styleUrls: ['./sending-post-capture.page.scss'],
})
export class SendingPostCapturePage {
  readonly asset$ = this.route.paramMap.pipe(
    map(params => params.get('id')),
    isNonNullable(),
    switchMap(id => this.diaBackendAssetRepository.getById$(id)),
    isNonNullable(),
    share()
  );
  readonly contact$ = this.route.paramMap.pipe(
    map(params => params.get('contact')),
    isNonNullable()
  );
  readonly username$ = this.contact$.pipe(
    map(contact => contact.substring(0, contact.lastIndexOf('@')))
  );
  previewCaption = '';
  isPreview = false;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository,
    private readonly proofRepository: ProofRepository,
    private readonly confirmAlert: ConfirmAlert,
    private readonly translocoService: TranslocoService,
    private readonly diaBackendTransactionRepository: DiaBackendTransactionRepository,
    private readonly blockingActionService: BlockingActionService
  ) {}

  preview() {
    this.isPreview = true;
  }

  async send(captionText: string) {
    const action$ = zip(this.asset$, this.contact$).pipe(
      first(),
      concatMap(([asset, contact]) =>
        this.diaBackendTransactionRepository.add$(
          asset.id,
          contact,
          captionText
        )
      ),
      concatMapTo(this.removeAsset$()),
      concatMapTo(
        defer(() => this.router.navigate(['../..'], { relativeTo: this.route }))
      )
    );

    const result = await this.confirmAlert.present(
      this.translocoService.translate('message.sendPostCaptureAlert')
    );

    if (result) {
      this.blockingActionService
        .run$(action$)
        .pipe(untilDestroyed(this))
        .subscribe();
    }
  }

  private removeAsset$() {
    return zip(this.asset$, this.proofRepository.getAll$()).pipe(
      first(),
      concatMap(async ([asset, proofs]) => {
        const proof = proofs.find(
          p => getOldProof(p).hash === asset.proof_hash
        );
        if (proof) {
          await this.proofRepository.remove(proof);
        }
      })
    );
  }
}
