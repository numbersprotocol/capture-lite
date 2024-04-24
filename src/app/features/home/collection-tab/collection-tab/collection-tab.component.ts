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
  selector: 'app-collection-tab',
  templateUrl: './collection-tab.component.html',
  styleUrls: ['./collection-tab.component.scss'],
})
export class CollectionTabComponent {
  readonly bubbleIframeUrlWithCachedJWTToke$ = combineLatest([
    this.diaBackendAuthService.cachedQueryJWTToken$,
    this.iframeService.CollectionTabRefreshRequested$,
  ]).pipe(
    map(([token, _]) => {
      const url = `${BUBBLE_IFRAME_URL}/collection?token=${token.access}&refresh_token=${token.refresh}`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    })
  );

  readonly networkConnected$ = this.networkService.connected$;

  @ViewChild('collectionIframe')
  collectionIframe?: ElementRef<HTMLIFrameElement>;

  constructor(
    private readonly networkService: NetworkService,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly iframeService: IframeService,
    private readonly sanitizer: DomSanitizer
  ) {
    iframeService.CollectionTabIframeNavigateBack$.pipe(
      tap(_ => this.navigateBackcollectionIframe()),
      untilDestroyed(this)
    ).subscribe();
  }

  navigateBackcollectionIframe() {
    this.collectionIframe?.nativeElement.contentWindow?.postMessage(
      IonicToBubblePostMessage.ANDROID_BACK_BUTTON,
      BUBBLE_IFRAME_URL
    );
  }
}
