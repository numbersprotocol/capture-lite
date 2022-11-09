import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { DiaBackendAuthService } from '../../../../shared/dia-backend/auth/dia-backend-auth.service';
import { BUBBLE_IFRAME_URL } from '../../../../shared/dia-backend/secret';
import { IframeService } from '../../../../shared/iframe/iframe.service';
import { NetworkService } from '../../../../shared/network/network.service';

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
      const url = `${BUBBLE_IFRAME_URL}/?token=${token.access}&refresh_token=${token.refresh}`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    })
  );

  readonly networkConnected$ = this.networkService.connected$;

  constructor(
    private readonly networkService: NetworkService,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly iframeService: IframeService,
    private readonly sanitizer: DomSanitizer
  ) {}
}
