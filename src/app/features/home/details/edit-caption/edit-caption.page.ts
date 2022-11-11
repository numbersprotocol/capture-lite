import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { fromEvent } from 'rxjs';
import { map, tap } from 'rxjs/operators';
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

  iframeUrl$ = this.id$.pipe(
    map(id => {
      const BUBBLE_IFRAME_URL =
        'https://iframe-postmsg-experiment.bubbleapps.io/version-test/edit-caption';
      const url = `${BUBBLE_IFRAME_URL}/?id=${id}`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    })
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly sanitizer: DomSanitizer,
    private readonly navController: NavController,
    private readonly iframeService: IframeService
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
