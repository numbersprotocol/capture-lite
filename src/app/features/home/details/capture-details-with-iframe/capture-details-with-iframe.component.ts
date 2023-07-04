import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NavController, Platform } from '@ionic/angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, ReplaySubject, combineLatest, fromEvent } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
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

  private readonly slideIsActive$ = new ReplaySubject<boolean>(1);
  @Input() set slideIsActive(value: boolean | undefined) {
    this.slideIsActive$.next(Boolean(value));
  }

  readonly reloadIframe$ = new BehaviorSubject<boolean>(true);

  readonly iframeUrl$ = combineLatest([
    this.detailedCaptureId$,
    this.diaBackendAuthService.cachedQueryJWTToken$,
    this.reloadIframe$,
  ]).pipe(
    map(([detailedCaptureId, token]) => {
      return this.generateIframeUrl(detailedCaptureId, token);
    })
  );

  readonly iframeLoaded$ = fromEvent<MessageEvent>(window, 'message').pipe(
    filter(event => event.data === BubbleToIonicPostMessage.IFRAME_ON_LOAD),
    untilDestroyed(this)
  );

  readonly captionEdited$ = fromEvent<MessageEvent>(window, 'message').pipe(
    map(event => event.data === BubbleToIonicPostMessage.EDIT_CAPTION_SAVE),
    untilDestroyed(this)
  );

  constructor(
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly sanitizer: DomSanitizer,
    private readonly networkService: NetworkService,
    private readonly navController: NavController,
    private readonly platform: Platform
  ) {
    this.reloadIframeOnCaptionChange();
  }

  private reloadIframeOnCaptionChange() {
    combineLatest([this.slideIsActive$, this.captionEdited$])
      .pipe(
        filter(([isActive, captionEdited]) => isActive && captionEdited),
        tap(() => this.reloadIframe$.next(true)),
        switchMap(() =>
          this.iframeLoaded$.pipe(
            take(1),
            tap(() => {
              /**
               * WORKAROUND: https://github.com/numbersprotocol/capture-lite/issues/2723
               * Navigate back 1 time programmatically when iframe is reloaded
               */
              if (this.platform.is('android')) {
                this.navController.back();
              }
            })
          )
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }

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
