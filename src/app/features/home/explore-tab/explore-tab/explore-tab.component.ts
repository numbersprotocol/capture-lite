import { Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { DiaBackendAuthService } from '../../../../shared/dia-backend/auth/dia-backend-auth.service';
import { BUBBLE_IFRAME_URL } from '../../../../shared/dia-backend/secret';
import { NetworkService } from '../../../../shared/network/network.service';

@Component({
  selector: 'app-explore-tab',
  templateUrl: './explore-tab.component.html',
  styleUrls: ['./explore-tab.component.scss'],
})
export class ExploreTabComponent {
  readonly bubbleIframeUrlWithCachedJWTToke$ =
    this.diaBackendAuthService.cachedQueryJWTToken$.pipe(
      map(token => {
        return `${BUBBLE_IFRAME_URL}/?token=${token.access}&refresh_token=${token.refresh}`;
      })
    );

  readonly networkConnected$ = this.networkService.connected$;

  constructor(
    private readonly networkService: NetworkService,
    private readonly diaBackendAuthService: DiaBackendAuthService
  ) {}
}
