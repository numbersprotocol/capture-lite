import { Component, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DiaBackendAuthService } from '../../../../shared/dia-backend/auth/dia-backend-auth.service';
import { BUBBLE_IFRAME_URL } from '../../../../shared/dia-backend/secret';
import { IonicToBubblePostMessage } from '../../../../shared/iframe/iframe';
import { IframeService } from '../../../../shared/iframe/iframe.service';
import { NetworkService } from '../../../../shared/network/network.service';

@UntilDestroy()
@Component({
  selector: 'app-explore-tab',
  templateUrl: './explore-tab.component.html',
  styleUrls: ['./explore-tab.component.scss'],
})
export class ExploreTabComponent {
  readonly bubbleIframeUrlWithCachedJWTToke$ = combineLatest([
    this.diaBackendAuthService.cachedQueryJWTToken$,
    this.iframeService.exploreTabRefreshRequested$,
  ]).pipe(
    map(([token, _]) => {
      const url = `${BUBBLE_IFRAME_URL}/collection?token=${token.access}&refresh_token=${token.refresh}`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    })
  );

  readonly networkConnected$ = this.networkService.connected$;

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
  }

  navigateBackExploreIframe() {
    this.exploreIframe?.nativeElement.contentWindow?.postMessage(
      IonicToBubblePostMessage.ANDROID_BACK_BUTTON,
      BUBBLE_IFRAME_URL
    );
  }
}
