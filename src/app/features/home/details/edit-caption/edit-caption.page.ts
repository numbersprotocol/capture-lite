import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, fromEvent } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DiaBackendAuthService } from '../../../../shared/dia-backend/auth/dia-backend-auth.service';
import { BUBBLE_IFRAME_URL } from '../../../../shared/dia-backend/secret';
import { IframeService } from '../../../../shared/iframe/iframe.service';
import { isNonNullable } from '../../../../utils/rx-operators/rx-operators';

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
    private readonly diaBackendAuthService: DiaBackendAuthService
  ) {
    this.processIframeEvents();
  }

  processIframeEvents() {
    fromEvent(window, 'message')
      .pipe(
        tap(event => {
          const postMessageEvent = event as MessageEvent;

          if (postMessageEvent.data === 'edit-caption-cancel') {
            this.navController.back();
          }

          if (postMessageEvent.data === 'edit-caption-save') {
            this.iframeService.refreshDetailsPageIframe();
            this.navController.back();
          }
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }
}
