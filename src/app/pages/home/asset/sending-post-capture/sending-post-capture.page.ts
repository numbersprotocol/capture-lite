import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, defer, zip } from 'rxjs';
import { concatMap, concatMapTo, first, map, switchMap } from 'rxjs/operators';
import { BlockingActionService } from 'src/app/services/blocking-action/blocking-action.service';
import { ConfirmAlert } from 'src/app/services/confirm-alert/confirm-alert.service';
import { AssetRepository } from 'src/app/services/publisher/numbers-storage/data/asset/asset-repository.service';
import { NumbersStorageApi } from 'src/app/services/publisher/numbers-storage/numbers-storage-api.service';
import { getOldProof } from 'src/app/services/repositories/proof/old-proof-adapter';
import { ProofRepository } from 'src/app/services/repositories/proof/proof-repository.service';
import { isNonNullable } from 'src/app/utils/rx-operators';

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
    switchMap(id => this.assetRepository.getById$(id)),
    isNonNullable()
  );
  private readonly proofsWithOld$ = this.proofRepository.getAll$().pipe(
    concatMap(proofs => Promise.all(proofs.map(async (proof) =>
      ({ proof, oldProof: await getOldProof(proof) })
    )))
  );
  readonly capture$ = combineLatest([this.asset$, this.proofsWithOld$]).pipe(
    map(([asset, proofsWithThumbnailAndOld]) => ({
      asset,
      proofWithThumbnailAndOld: proofsWithThumbnailAndOld.find(p => p.oldProof.hash === asset.proof_hash)
    })),
    isNonNullable()
  );
  readonly base64Src$ = this.capture$.pipe(
    map(capture => capture.proofWithThumbnailAndOld),
    isNonNullable(),
    map(p => `data:${Object.values(p.proof.assets)[0].mimeType};base64,${Object.keys(p.proof.assets)[0]}`)
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
    private readonly assetRepository: AssetRepository,
    private readonly proofRepository: ProofRepository,
    private readonly confirmAlert: ConfirmAlert,
    private readonly translocoService: TranslocoService,
    private readonly numbersStorageApi: NumbersStorageApi,
    private readonly blockingActionService: BlockingActionService
  ) { }

  preview(captionText: string) {
    this.isPreview = true;
  }

  send(captionText: string) {
    const action$ = zip(this.asset$, this.contact$).pipe(
      first(),
      concatMap(([asset, contact]) => this.numbersStorageApi.createTransaction$(asset.id, contact, captionText)),
      concatMapTo(this.removeAsset$()),
      concatMapTo(defer(() => this.router.navigate(['../..'], { relativeTo: this.route })))
    );

    const onConfirm = () => {
      this.blockingActionService.run$(action$).pipe(
        untilDestroyed(this)
      ).subscribe();
    };

    this.confirmAlert.present$(
      onConfirm,
      this.translocoService.translate('message.sendPostCaptureAlert')
    ).pipe(
      untilDestroyed(this)
    ).subscribe();
  }

  private removeAsset$() {
    return this.asset$.pipe(
      concatMap(asset => this.assetRepository.remove$(asset))
    );
  }
}
