import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { EMPTY, ReplaySubject, combineLatest, defer } from 'rxjs';
import { concatMap, first, map, shareReplay, switchMap } from 'rxjs/operators';
import { getAssetProfileForNSE } from '../../../../utils/url';
import { DetailedCapture } from '../information/session/information-session.service';

@UntilDestroy()
@Component({
  selector: 'app-capture-details-with-ionic',
  templateUrl: './capture-details-with-ionic.component.html',
  styleUrls: ['./capture-details-with-ionic.component.scss'],
})
export class CaptureDetailsWithIonicComponent {
  captionOn = true;

  readonly detailedCapture$ = new ReplaySubject<DetailedCapture>(1);
  readonly detailedCaptureTmpShareToken$ = new ReplaySubject<string>(1);
  readonly nftToken$ = this.detailedCapture$.pipe(
    switchMap(c => c.nftToken$),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  readonly date$ = this.detailedCapture$.pipe(
    switchMap(c => c.timestamp$),
    map(timestamp => {
      return timestamp
        ? this.datePipe.transform(timestamp, 'MMMM d, y')
        : this.translocoService.translate('notDisclosed');
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly signature$ = this.detailedCapture$.pipe(
    switchMap(capture => capture.signature$),
    map(signature => signature.signature),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  informationShowMore = false;

  @Input()
  set detailedCapture(value: DetailedCapture | undefined) {
    if (value) this.detailedCapture$.next(value);
  }

  @Input()
  set detailedCaptureTmpShareToken(value: string | undefined) {
    if (value) this.detailedCaptureTmpShareToken$.next(value);
  }

  constructor(
    private readonly translocoService: TranslocoService,
    private readonly datePipe: DatePipe
  ) {}

  openMap() {
    return this.detailedCapture$
      .pipe(
        first(),
        switchMap(capture => capture.geolocation$),
        concatMap(geolocation =>
          defer(() => {
            if (geolocation)
              return Browser.open({
                url: `https://maps.google.com/maps?q=${geolocation.latitude},${geolocation.longitude}`,
                toolbarColor: '#564dfc',
              });
            return EMPTY;
          })
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }

  openCertificate() {
    combineLatest([this.detailedCapture$, this.detailedCaptureTmpShareToken$])
      .pipe(
        first(),
        concatMap(([detailedCapture, tmpShareToken]) =>
          defer(() =>
            Browser.open({
              url: getAssetProfileForNSE(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                detailedCapture.id!,
                tmpShareToken
              ),
              toolbarColor: '#564dfc',
            })
          )
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }

  toggleShowMore() {
    this.informationShowMore = !this.informationShowMore;
  }
}
