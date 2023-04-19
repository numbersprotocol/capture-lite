import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ReplaySubject, combineLatest, fromEvent } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import {
  CachedQueryJWTToken,
  DiaBackendAuthService,
} from '../../../../shared/dia-backend/auth/dia-backend-auth.service';
import { BUBBLE_IFRAME_URL } from '../../../../shared/dia-backend/secret';
import { BubbleToIonicPostMessage } from '../../../../shared/iframe/iframe';
import { NetworkService } from '../../../../shared/network/network.service';
import { isNonNullable } from '../../../../utils/rx-operators/rx-operators';
import { DetailedCapture } from '../information/session/information-session.service';

@UntilDestroy()
@Component({
  selector: 'app-capture-details-with-iframe',
  templateUrl: './capture-details-with-iframe.component.html',
  styleUrls: ['./capture-details-with-iframe.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CaptureDetailsWithIframeComponent {
  readonly networkConnected$ = this.networkService.connected$;

  private readonly detailedCapture$ = new ReplaySubject<DetailedCapture>(1);
  @Input() set detailedCapture(value: DetailedCapture | undefined) {
    if (value) this.detailedCapture$.next(value);
  }

  private readonly detailedCaptureId$ = this.detailedCapture$.pipe(
    map(detailedCapture => detailedCapture.id),
    isNonNullable(),
    distinctUntilChanged()
  );

  readonly iframeUrl$ = combineLatest([
    this.detailedCaptureId$,
    this.diaBackendAuthService.cachedQueryJWTToken$,
  ]).pipe(
    map(([detailedCaptureId, token]) => {
      return this.generateIframeUrl(detailedCaptureId, token);
    })
  );

  readonly iframeLoaded$ = fromEvent<MessageEvent>(window, 'message').pipe(
    filter(event => event.data === BubbleToIonicPostMessage.IFRAME_ON_LOAD),
    untilDestroyed(this)
  );

  constructor(
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly sanitizer: DomSanitizer,
    private readonly networkService: NetworkService
  ) {}

  private generateIframeUrl(
    detailedCaptureId: string,
    { access, refresh }: CachedQueryJWTToken
  ) {
    const params = new URLSearchParams({
      nid: detailedCaptureId,
      token: access,
      refresh_token: refresh,
      from: 'mycapture',
    });
    const url = `${BUBBLE_IFRAME_URL}/asset_page?${params.toString()}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
