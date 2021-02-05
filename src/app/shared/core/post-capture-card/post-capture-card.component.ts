import { Component, Input, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Plugins } from '@capacitor/core';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, defer, zip } from 'rxjs';
import { concatMap, first, map, tap } from 'rxjs/operators';
import { DiaBackendAsset } from '../../../shared/services/dia-backend/asset/dia-backend-asset-repository.service';
import { DiaBackendAuthService } from '../../../shared/services/dia-backend/auth/dia-backend-auth.service';
import { isNonNullable } from '../../../utils/rx-operators/rx-operators';
import { ShareService } from '../../services/share/share.service';
import {
  Option,
  OptionsMenuComponent,
} from './options-menu/options-menu.component';

const { Browser } = Plugins;

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-post-capture-card',
  templateUrl: './post-capture-card.component.html',
  styleUrls: ['./post-capture-card.component.scss'],
})
export class PostCaptureCardComponent implements OnInit {
  @Input() readonly sharable = true;
  @Input() private readonly postCapture!: DiaBackendAsset;

  private readonly _postCapture$ = new BehaviorSubject(this.postCapture);

  readonly postCapture$ = this._postCapture$
    .asObservable()
    .pipe(isNonNullable());

  readonly location$ = this.postCapture$.pipe(
    map(postCapture => {
      const lat = postCapture.parsed_meta.capture_latitude;
      const lon = postCapture.parsed_meta.capture_longitude;
      return lat && lon && lat !== 'undefined' && lon !== 'undefined'
        ? `${lat}, ${lon}`
        : this.translocoService.translate('locationNotProvided');
    })
  );

  openMore = false;

  constructor(
    private readonly translocoService: TranslocoService,
    private readonly bottomSheet: MatBottomSheet,
    private readonly shareService: ShareService,
    private readonly diaBackendAuthService: DiaBackendAuthService
  ) {}

  ngOnInit() {
    this._postCapture$.next(this.postCapture);
  }

  openOptionsMenu() {
    const bottomSheetRef = this.bottomSheet.open(OptionsMenuComponent);
    bottomSheetRef
      .afterDismissed()
      .pipe(
        tap((option?: Option) => {
          if (option === Option.Share) {
            this.share();
          } else if (option === Option.ViewCertificate) {
            this.openCertificate();
          }
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private share() {
    return this.postCapture$
      .pipe(
        first(),
        concatMap(postCapture => this.shareService.share(postCapture)),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private openCertificate() {
    zip(this.postCapture$, this.diaBackendAuthService.token$)
      .pipe(
        first(),
        concatMap(([postCapture, token]) =>
          defer(() => {
            Browser.open({
              url: `https://authmedia.net/dia-certificate?mid=${postCapture.id}&token=${token}`,
            });
          })
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }
}
