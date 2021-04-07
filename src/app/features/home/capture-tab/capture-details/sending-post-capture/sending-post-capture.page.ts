import { formatDate } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, defer, Observable, of } from 'rxjs';
import {
  catchError,
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
import { DiaBackendAuthService } from '../../../../../shared/services/dia-backend/auth/dia-backend-auth.service';
import {
  DiaBackendContact,
  DiaBackendContactRepository,
} from '../../../../../shared/services/dia-backend/contact/dia-backend-contact-repository.service';
import { DiaBackendTransactionRepository } from '../../../../../shared/services/dia-backend/transaction/dia-backend-transaction-repository.service';
import { getOldProof } from '../../../../../shared/services/repositories/proof/old-proof-adapter';
import { ProofRepository } from '../../../../../shared/services/repositories/proof/proof-repository.service';
import {
  isNonNullable,
  switchTap,
} from '../../../../../utils/rx-operators/rx-operators';
import { toDataUrl } from '../../../../../utils/url';

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
    switchMap(id => this.diaBackendAssetRepository.fetchById$(id)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly assetFileUrl$ = combineLatest([
    this.asset$,
    this.proofRepository.all$,
  ]).pipe(
    switchMap(async ([asset, proofs]) => {
      const proof = proofs.find(p => p.diaBackendAssetId === asset.id);
      if (proof) {
        const proofAssets = await proof.getAssets();
        const [base64, meta] = Object.entries(proofAssets)[0];
        return toDataUrl(base64, meta.mimeType);
      }
    })
  );

  private readonly receiverEmail$ = this.route.paramMap.pipe(
    map(params => params.get('contact')),
    isNonNullable()
  );

  readonly receiver$: Observable<DiaBackendContact> = this.receiverEmail$.pipe(
    switchMap(email =>
      this.diaBackendContactRepository.fetchByEmail$(email).pipe(
        catchError(() =>
          of({
            contact_email: email,
            contact_name: email,
            contact_profile_picture_thumbnail:
              '/assets/images/avatar-placeholder.png',
          })
        )
      )
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly username$ = this.receiverEmail$.pipe(
    map(contact => contact.substring(0, contact.lastIndexOf('@')))
  );

  readonly previewAsset$ = combineLatest([
    this.asset$,
    this.receiverEmail$,
    this.assetFileUrl$,
  ]).pipe(
    switchMap(async ([asset, contact, assetFileUrl]) => {
      const previewAsset: DiaBackendAsset = {
        ...asset,
        asset_file: assetFileUrl ?? asset.asset_file,
        asset_file_thumbnail: assetFileUrl ?? asset.asset_file_thumbnail,
        sharable_copy: assetFileUrl ?? asset.sharable_copy,
        caption: this.previewCaption,
        source_transaction: {
          id: '',
          sender: asset.owner_name,
          receiver_email: contact,
          created_at: '',
          fulfilled_at: formatDate(Date.now(), 'short', 'en-US'),
          expired: false,
        },
      };
      return previewAsset;
    })
  );

  readonly ownerAvatar$ = this.diaBackendAuthService.avatar$.pipe(
    shareReplay({ bufferSize: 1, refCount: true })
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
    private readonly blockingActionService: BlockingActionService,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly diaBackendContactRepository: DiaBackendContactRepository
  ) {}

  preview() {
    this.isPreview = true;
  }

  onBackButtonClick() {
    if (this.isPreview) {
      this.isPreview = false;
    } else {
      this.router.navigate(['..'], { relativeTo: this.route });
    }
  }

  async send(captionText: string) {
    const action$ = combineLatest([this.asset$, this.receiverEmail$]).pipe(
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

    const result = await this.confirmAlert.present({
      message: this.translocoService.translate('message.sendPostCaptureAlert'),
    });

    if (result) {
      this.blockingActionService
        .run$(action$)
        .pipe(untilDestroyed(this))
        .subscribe();
    }
  }

  private removeAsset$(asset: DiaBackendAsset) {
    return this.proofRepository.all$.pipe(
      first(),
      concatMap(async proofs => {
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
