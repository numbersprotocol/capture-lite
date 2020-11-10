import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { map, switchMap, tap } from 'rxjs/operators';
import { ConfirmAlert } from 'src/app/services/confirm-alert/confirm-alert.service';
import { CaptionRepository } from 'src/app/services/data/caption/caption-repository.service';
import { ProofRepository } from 'src/app/services/data/proof/proof-repository.service';
import { AssetRepository } from 'src/app/services/publisher/numbers-storage/data/asset/asset-repository.service';
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
  readonly proof$ = this.asset$.pipe(
    switchMap(asset => this.proofRepository.getByHash$(asset.proof_hash)),
    isNonNullable()
  );
  readonly base64Src$ = this.proof$.pipe(
    switchMap(proof => this.proofRepository.getRawFile$(proof)),
    map(rawBase64 => `data:image/png;base64,${rawBase64}`)
  );
  readonly contact$ = this.route.paramMap.pipe(
    map(params => params.get('contact')),
    isNonNullable()
  );
  readonly userName$ = this.contact$.pipe(
    map(contact => contact.substring(0, contact.lastIndexOf('@')))
  );
  previewCaption = '';
  isPreview = false;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly assetRepository: AssetRepository,
    private readonly proofRepository: ProofRepository,
    private readonly captionRepository: CaptionRepository,
    private readonly confirmAlert: ConfirmAlert,
    private readonly translocoService: TranslocoService
  ) { }

  preview(captionText: string) {
    this.proof$.pipe(
      switchMap(proof => this.captionRepository.addOrEdit$({
        proofHash: proof.hash,
        text: captionText
      })),
      tap(_ => this.isPreview = true),
      untilDestroyed(this)
    ).subscribe();
  }

  send() {
    this.confirmAlert.present$(
      () => this.router.navigate(['../..'], { relativeTo: this.route }),
      this.translocoService.translate('message.sendPostCaptureAlert')
    ).pipe(
      untilDestroyed(this)
    ).subscribe();
  }
}
