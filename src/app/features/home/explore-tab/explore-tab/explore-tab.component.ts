import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ErrorService } from '../../../../shared/error/error.service';
import { NetworkService } from '../../../../shared/network/network.service';

@Component({
  selector: 'app-explore-tab',
  templateUrl: './explore-tab.component.html',
  styleUrls: ['./explore-tab.component.scss'],
})
export class ExploreTabComponent {
  // TODO: change url to point to production bubble app
  readonly bubbleIframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    'https://captureappiframe.bubbleapps.io/version-test/'
  );

  readonly networkConnected$ = this.networkService.connected$;

  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly networkService: NetworkService,
    private readonly errorService: ErrorService
  ) {}
}
