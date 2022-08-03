import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { map } from 'rxjs/operators';
import { DiaBackendAuthService } from '../../../../shared/dia-backend/auth/dia-backend-auth.service';
import { ErrorService } from '../../../../shared/error/error.service';
import { NetworkService } from '../../../../shared/network/network.service';
import { isNonNullable } from '../../../../utils/rx-operators/rx-operators';

@Component({
  selector: 'app-explore-tab',
  templateUrl: './explore-tab.component.html',
  styleUrls: ['./explore-tab.component.scss'],
})
export class ExploreTabComponent {
  readonly bubbleIframeUrl$ = this.diaBackendAuthService.token$.pipe(
    isNonNullable(),
    map(token => {
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://captureappiframe.bubbleapps.io/version-test?token=${token}`
      );
    })
  );

  readonly networkConnected$ = this.networkService.connected$;

  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly networkService: NetworkService,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly errorService: ErrorService
  ) {}
}
