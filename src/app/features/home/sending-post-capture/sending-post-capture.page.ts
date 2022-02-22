import { formatDate } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
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
import { BlockingActionService } from '../../../shared/blocking-action/blocking-action.service';
import { ConfirmAlert } from '../../../shared/confirm-alert/confirm-alert.service';
import {
  DiaBackendAsset,
  DiaBackendAssetRepository,
} from '../../../shared/dia-backend/asset/dia-backend-asset-repository.service';
import { DiaBackendAuthService } from '../../../shared/dia-backend/auth/dia-backend-auth.service';
import {
  DiaBackendContact,
  DiaBackendContactRepository,
} from '../../../shared/dia-backend/contact/dia-backend-contact-repository.service';
import { DiaBackendTransactionRepository } from '../../../shared/dia-backend/transaction/dia-backend-transaction-repository.service';
import { ErrorService } from '../../../shared/error/error.service';
import { getOldProof } from '../../../shared/repositories/proof/old-proof-adapter';
import { ProofRepository } from '../../../shared/repositories/proof/proof-repository.service';
import {
  isNonNullable,
  switchTap,
} from '../../../utils/rx-operators/rx-operators';

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
    catchError((err: unknown) => this.errorService.toastError$(err)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly mimeType$ = this.asset$.pipe(
    map(asset => asset.information.proof?.mimeType),
    isNonNullable()
  );

  readonly assetFileUrl$ = combineLatest([
    this.asset$,
    this.proofRepository.all$,
  ]).pipe(
    switchMap(async ([asset, proofs]) => {
      const proof = proofs.find(p => p.diaBackendAssetId === asset.id);
      if (proof) return proof.getFirstAssetUrl();
      return asset.asset_file;
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
        asset_file: assetFileUrl,
        asset_file_thumbnail: assetFileUrl,
        sharable_copy: assetFileUrl,
        caption: this.message !== '' ? this.message : asset.caption,
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

  message = '';

  isPreview = false;

  shouldCreateContact = true;

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
    private readonly diaBackendContactRepository: DiaBackendContactRepository,
    private readonly errorService: ErrorService,
    private readonly navController: NavController
  ) {}

  ionViewWillEnter() {
    this.asset$.pipe(untilDestroyed(this)).subscribe(asset => {
      this.message = asset.caption;
    });
  }

  preview() {
    this.isPreview = true;
  }

  onBackButtonClick() {
    if (this.isPreview) {
      this.isPreview = false;
    } else {
      this.navController.back();
    }
  }

  async send() {
    const action$ = combineLatest([this.asset$, this.receiverEmail$]).pipe(
      first(),
      switchTap(([asset, contact]) =>
        this.diaBackendTransactionRepository.add$({
          assetId: asset.id,
          targetEmail: contact,
          caption: this.message !== '' ? this.message : asset.caption,
          createContact: this.shouldCreateContact,
        })
      ),
      concatMap(([asset]) => this.removeAsset$(asset)),
      concatMapTo(defer(() => this.router.navigate(['/home']))),
      catchError((err: unknown) => this.errorService.toastError$(err))
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
