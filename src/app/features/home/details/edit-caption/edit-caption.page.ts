import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, fromEvent, of } from 'rxjs';
import {
  concatMap,
  finalize,
  first,
  map,
  tap as switchTap,
} from 'rxjs/operators';
import { DiaBackendAuthService } from '../../../../shared/dia-backend/auth/dia-backend-auth.service';
import { BUBBLE_IFRAME_URL } from '../../../../shared/dia-backend/secret';
import { BubbleToIonicPostMessage } from '../../../../shared/iframe/iframe';
import { IframeService } from '../../../../shared/iframe/iframe.service';
import { getOldProof } from '../../../../shared/repositories/proof/old-proof-adapter';
import { ProofRepository } from '../../../../shared/repositories/proof/proof-repository.service';
import { isNonNullable } from '../../../../utils/rx-operators/rx-operators';
import { InformationSessionService } from '../information/session/information-session.service';

@UntilDestroy()
@Component({
  selector: 'app-edit-caption',
  templateUrl: './edit-caption.page.html',
  styleUrls: ['./edit-caption.page.scss'],
})
export class EditCaptionPage {
  private readonly id$ = this.route.paramMap.pipe(
    map(params => params.get('id')),
    isNonNullable()
  );

  iframeUrl$ = combineLatest([
    this.id$,
    this.diaBackendAuthService.cachedQueryJWTToken$,
  ]).pipe(
    map(([id, token]) => {
      const params =
        `nid=${id}` +
        `&token=${token.access}` +
        `&refresh_token=${token.refresh}` +
        `&from=mycapture`;
      const url = `${BUBBLE_IFRAME_URL}/edit?${params}`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    })
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly sanitizer: DomSanitizer,
    private readonly navController: NavController,
    private readonly iframeService: IframeService,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly informationSessionService: InformationSessionService,
    private readonly proofRepository: ProofRepository
  ) {
    this.processIframeEvents();
  }

  processIframeEvents() {
    fromEvent(window, 'message')
      .pipe(
        switchTap(event => {
          const postMessageEvent = event as MessageEvent;
          const data = postMessageEvent.data as BubbleToIonicPostMessage;
          switch (data) {
            case BubbleToIonicPostMessage.EDIT_CAPTION_CANCEL:
              this.navController.back();
              break;
            case BubbleToIonicPostMessage.EDIT_CAPTION_SAVE:
              this.iframeService.refreshDetailsPageIframe();
              this.syncCaptionAndNavigateBack();
              break;
          }
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  syncCaptionAndNavigateBack() {
    if (this.informationSessionService.activatedDetailedCapture) {
      combineLatest([
        this.informationSessionService.activatedDetailedCapture.proof$,
        this.informationSessionService.activatedDetailedCapture.caption$,
      ])
        .pipe(
          first(),
          concatMap(([proof, latestCaptionFromBackend]) => {
            if (proof) {
              proof.caption = latestCaptionFromBackend;
              return this.proofRepository.update(
                [proof],
                (x, y) => getOldProof(x).hash === getOldProof(y).hash
              );
            }
            return of(null);
          }),
          finalize(() => this.navController.back())
        )
        .subscribe();
    }
  }
}
