import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { defer } from 'rxjs';
import { map } from 'rxjs/operators';
import { DiaBackendAuthService } from '../../../../shared/dia-backend/auth/dia-backend-auth.service';
import { BUBBLE_IFRAME_URL } from '../../../../shared/dia-backend/secret';
import { ErrorService } from '../../../../shared/error/error.service';
import { NetworkService } from '../../../../shared/network/network.service';

@Component({
  selector: 'app-explore-tab',
  templateUrl: './explore-tab.component.html',
  styleUrls: ['./explore-tab.component.scss'],
})
export class ExploreTabComponent {
  readonly bubbleIframeUrlWithJWTToken$ = defer(() => {
    return this.diaBackendAuthService.queryJWTToken$().pipe(
      map(token => {
        return `${BUBBLE_IFRAME_URL}/version-qa-release/?token=${token.access}&refresh_token=${token.refresh}`;
      })
    );
  });

  readonly networkConnected$ = this.networkService.connected$;

  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly networkService: NetworkService,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly errorService: ErrorService
  ) {}
}
