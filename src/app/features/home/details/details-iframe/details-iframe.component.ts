import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { UntilDestroy } from '@ngneat/until-destroy';
import { combineLatest, fromEvent, ReplaySubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import {
  CachedQueryJWTToken,
  DiaBackendAuthService,
} from '../../../../shared/dia-backend/auth/dia-backend-auth.service';
import { BUBBLE_IFRAME_URL } from '../../../../shared/dia-backend/secret';
import { NetworkService } from '../../../../shared/network/network.service';
import { DetailedCapture } from '../information/session/information-session.service';

@UntilDestroy()
@Component({
  selector: 'app-detailed-capture-iframe',
  templateUrl: './details-iframe.component.html',
  styleUrls: ['./details-iframe.component.scss'],
})
export class DetailsIframeComponent {
  readonly networkConnected$ = this.networkService.connected$;

  private readonly detailedCapture$ = new ReplaySubject<DetailedCapture>(1);
  @Input() set detailedCapture(value: DetailedCapture | undefined) {
    if (value) this.detailedCapture$.next(value);
  }

  readonly iframeUrl$ = combineLatest([
    this.detailedCapture$,
    this.diaBackendAuthService.cachedQueryJWTToken$,
  ]).pipe(
    map(([detailedCapture, token]) => {
      return this.generateIframeUrl(detailedCapture, token);
    })
  );

  readonly iframeLoaded$ = fromEvent(window, 'message').pipe(
    map(event => (event as MessageEvent).data),
    filter(data => data === 'iframe-on-load') // TODO: use enum
  );

  constructor(
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly sanitizer: DomSanitizer,
    private readonly networkService: NetworkService
  ) {}

  private generateIframeUrl(
    detailedCapture: DetailedCapture,
    token: CachedQueryJWTToken
  ) {
    const params =
      `nid=${detailedCapture.id}` +
      `&token=${token.access}` +
      `&refresh_token=${token.refresh}` +
      `&from=mycapture`;
    const url = `${BUBBLE_IFRAME_URL}/asset_page?${params}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}