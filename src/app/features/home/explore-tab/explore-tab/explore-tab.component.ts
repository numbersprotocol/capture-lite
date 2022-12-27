import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, combineLatest, fromEvent } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DiaBackendAuthService } from '../../../../shared/dia-backend/auth/dia-backend-auth.service';
import { BUBBLE_IFRAME_URL } from '../../../../shared/dia-backend/secret';
import { IframeService } from '../../../../shared/iframe/iframe.service';
import { NetworkService } from '../../../../shared/network/network.service';

@UntilDestroy()
@Component({
  selector: 'app-explore-tab',
  templateUrl: './explore-tab.component.html',
  styleUrls: ['./explore-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExploreTabComponent {
  readonly bubbleIframeUrlWithCachedJWTToke$ = combineLatest([
    this.diaBackendAuthService.cachedQueryJWTToken$,
    this.iframeService.exploreTabRefreshRequested$,
  ]).pipe(
    map(([token, _]) => {
      const url = `${BUBBLE_IFRAME_URL}/?token=${token.access}&refresh_token=${token.refresh}`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    })
  );

  readonly networkConnected$ = this.networkService.connected$;

  readonly isIframeHidden$ = new BehaviorSubject(true);

  readonly iframeHiddenStyle$ = this.isIframeHidden$.pipe(
    map(hidden => ({ visibility: hidden ? 'hidden' : 'visible' }))
  );

  @ViewChild('exploreIframe') exploreIframe?: ElementRef<HTMLIFrameElement>;

  constructor(
    private readonly networkService: NetworkService,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly iframeService: IframeService,
    private readonly sanitizer: DomSanitizer
  ) {
    iframeService.exploreTabIframeNavigateBack$
      .pipe(
        tap(_ => this.navigateBackExploreIframe()),
        untilDestroyed(this)
      )
      .subscribe();

    this.processIframePageLoadEvents();
  }

  navigateBackExploreIframe() {
    this.exploreIframe?.nativeElement.contentWindow?.postMessage(
      'android-back-button',
      BUBBLE_IFRAME_URL
    );
  }

  private processIframePageLoadEvents() {
    fromEvent(window, 'message')
      .pipe(
        tap(event => {
          const postMessageEvent = event as MessageEvent;
          const hideIframeOnEvents = [
            'iframe-on-beforeunload', // not firing on safari as of Dec 27 22
            'iframe-on-unload',
            'iframe-on-DOMContentLoaded',
          ];
          const showIframeOnEvents = ['iframe-on-load'];
          if (hideIframeOnEvents.includes(postMessageEvent.data)) {
            this.isIframeHidden$.next(true);
          }
          if (showIframeOnEvents.includes(postMessageEvent.data)) {
            this.isIframeHidden$.next(false);
          }
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }
}
