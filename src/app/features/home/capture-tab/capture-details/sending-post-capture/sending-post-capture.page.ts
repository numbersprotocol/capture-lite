import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, defer } from 'rxjs';
import {
  concatMap,
  concatMapTo,
  first,
  map,
  shareReplay,
  switchMap,
} from 'rxjs/operators';
import { BlockingActionService } from '../../../../../shared/services/blocking-action/blocking-action.service';
import { ConfirmAlert } from '../../../../../shared/services/confirm-alert/confirm-alert.service';
import {
  DiaBackendAsset,
  DiaBackendAssetRepository,
} from '../../../../../shared/services/dia-backend/asset/dia-backend-asset-repository.service';
import { DiaBackendTransactionRepository } from '../../../../../shared/services/dia-backend/transaction/dia-backend-transaction-repository.service';
import { getOldProof } from '../../../../../shared/services/repositories/proof/old-proof-adapter';
import { ProofRepository } from '../../../../../shared/services/repositories/proof/proof-repository.service';
import {
  isNonNullable,
  switchTap,
} from '../../../../../utils/rx-operators/rx-operators';

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
    shareReplay({ bufferSize: 1, refCount: true })
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
    const action$ = combineLatest([this.asset$, this.contact$]).pipe(
      first(),
      switchTap(([asset, contact]) =>
        this.diaBackendTransactionRepository.add$(
          asset.id,
          contact,
          captionText
        )
      ),
      concatMap(([asset]) => this.removeAsset$(asset)),
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

  private removeAsset$(asset: DiaBackendAsset) {
    return this.proofRepository.getAll$().pipe(
      first(),
      concatMap(async proofs => {
        const proof = proofs.find(
          p => getOldProof(p).hash === asset.proof_hash
        );
        if (proof) {
          await this.proofRepository.remove(proof);
        }
      }),
      concatMapTo(this.diaBackendAssetRepository.refresh$()),
      concatMapTo(this.diaBackendAssetRepository.removeCache$(asset))
    );
  }
}
