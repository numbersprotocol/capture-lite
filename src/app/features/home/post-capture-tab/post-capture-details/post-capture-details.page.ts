import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { ActionSheetController, NavController } from '@ionic/angular';
import { ActionSheetButton } from '@ionic/core';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, EMPTY, zip } from 'rxjs';
import {
  catchError,
  concatMap,
  first,
  map,
  shareReplay,
  switchMap,
} from 'rxjs/operators';
import { ContactSelectionDialogComponent } from '../../../../shared/contact-selection-dialog/contact-selection-dialog.component';
import {
  DiaBackendAsset,
  DiaBackendAssetRepository,
} from '../../../../shared/dia-backend/asset/dia-backend-asset-repository.service';
import { DiaBackendAuthService } from '../../../../shared/dia-backend/auth/dia-backend-auth.service';
import { ErrorService } from '../../../../shared/error/error.service';
import { OldDefaultInformationName } from '../../../../shared/repositories/proof/old-proof-adapter';
import { ShareService } from '../../../../shared/share/share.service';
import { isNonNullable } from '../../../../utils/rx-operators/rx-operators';

const { Browser } = Plugins;

@UntilDestroy()
@Component({
  selector: 'app-post-capture-details',
  templateUrl: './post-capture-details.page.html',
  styleUrls: ['./post-capture-details.page.scss'],
})
export class PostCaptureDetailsPage {
  readonly diaBackendAsset$ = this.route.paramMap.pipe(
    map(params => params.get('id')),
    isNonNullable(),
    switchMap(id => this.diaBackendAssetRepository.getPostCaptureById$(id)),
    catchError((err: unknown) => this.errorService.toastError$(err)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly mediaSrc$ = this.diaBackendAsset$.pipe(
    switchMap(asset =>
      this.diaBackendAssetRepository.getAndCachePostCaptureMedia$(asset)
    ),
    catchError((err: unknown) => this.errorService.toastError$(err)),
    first(),
    map(blob => URL.createObjectURL(blob)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly location$ = this.diaBackendAsset$.pipe(
    map(diaBackendAsset => {
      const geolocation = getValidGeolocation(diaBackendAsset);
      if (geolocation) {
        const fixedLength = 6;
        return `${Number(geolocation.latitude).toFixed(fixedLength)}, ${Number(
          geolocation.longitude
        ).toFixed(fixedLength)}`;
      }
      return this.translocoService.translate<string>('locationNotProvided');
    })
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository,
    private readonly translocoService: TranslocoService,
    private readonly actionSheetController: ActionSheetController,
    private readonly shareService: ShareService,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly navController: NavController,
    private readonly errorService: ErrorService,
    private readonly dialog: MatDialog,
    private readonly router: Router
  ) {}

  back() {
    this.navController.back();
  }

  openContactSelectionDialog() {
    const dialogRef = this.dialog.open(ContactSelectionDialogComponent, {
      minWidth: '90%',
      autoFocus: false,
      data: { email: '' },
    });
    const contact$ = dialogRef.afterClosed().pipe(isNonNullable());

    return combineLatest([contact$, this.diaBackendAsset$])
      .pipe(first(), untilDestroyed(this))
      .subscribe(([contact, diaBackendAsset]) =>
        this.router.navigate(
          ['../sending-post-capture', { contact, id: diaBackendAsset.id }],
          { relativeTo: this.route }
        )
      );
  }

  openOptionsMenu() {
    return combineLatest([
      this.diaBackendAsset$,
      this.translocoService.selectTranslateObject({
        'message.shareCapture': null,
        'message.viewOnCaptureClub': null,
        'message.viewBlockchainCertificate': null,
        'message.viewSupportingVideoOnIpfs': null,
      }),
    ])
      .pipe(
        first(),
        concatMap(
          ([
            diaBackendAsset,
            [
              shareCapture,
              viewOnCaptureClub,
              viewBlockchainCertificate,
              viewSupportingVideoOnIpfs,
            ],
          ]) => {
            const buttons: ActionSheetButton[] = [];
            if (diaBackendAsset.supporting_file) {
              buttons.push({
                text: viewSupportingVideoOnIpfs,
                handler: () => {
                  this.openIpfsSupportingVideo();
                },
              });
            }
            buttons.push({
              text: shareCapture,
              handler: () => {
                this.share();
              },
            });
            if (diaBackendAsset.source_type === 'store') {
              buttons.push({
                text: viewOnCaptureClub,
                handler: () => {
                  this.openCaptureClub();
                },
              });
            }
            buttons.push({
              text: viewBlockchainCertificate,
              handler: () => {
                this.openCertificate();
              },
            });
            return this.actionSheetController.create({ buttons });
          }
        ),
        concatMap(actionSheet => actionSheet.present()),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private share() {
    return this.diaBackendAsset$
      .pipe(
        first(),
        switchMap(diaBackendAsset => this.shareService.share(diaBackendAsset)),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private openCaptureClub() {
    return this.diaBackendAsset$
      .pipe(
        first(),
        concatMap(diaBackendAsset =>
          Browser.open({
            url: `https://captureclub.cc/asset?mid=${diaBackendAsset.id}`,
            toolbarColor: '#564dfc',
          })
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private openCertificate() {
    return zip(this.diaBackendAsset$, this.diaBackendAuthService.token$)
      .pipe(
        first(),
        switchMap(([diaBackendAsset, token]) =>
          Browser.open({
            url: `https://authmedia.net/dia-certificate?mid=${diaBackendAsset.id}&token=${token}`,
            toolbarColor: '#564dfc',
          })
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }

  openMap() {
    return this.diaBackendAsset$
      .pipe(
        first(),
        map(getValidGeolocation),
        isNonNullable(),
        switchMap(geolocation =>
          Browser.open({
            url: `https://maps.google.com/maps?q=${geolocation.latitude},${geolocation.longitude}`,
            toolbarColor: '#564dfc',
          })
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }

  openIpfsSupportingVideo() {
    return this.diaBackendAsset$
      .pipe(
        first(),
        switchMap(diaBackendAsset => {
          if (!diaBackendAsset.supporting_file) return EMPTY;
          return Browser.open({
            url: diaBackendAsset.supporting_file.replace(
              'ipfs://',
              'https://ipfs.io/ipfs/'
            ),
            toolbarColor: '#564dfc',
          });
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }
}

function getValidGeolocation(diaBackendAsset: DiaBackendAsset) {
  const latitude = diaBackendAsset.information.information?.find(
    info => info.name === OldDefaultInformationName.GEOLOCATION_LATITUDE
  )?.value;
  const longitude = diaBackendAsset.information.information?.find(
    info => info.name === OldDefaultInformationName.GEOLOCATION_LONGITUDE
  )?.value;
  if (
    latitude &&
    longitude &&
    latitude !== 'undefined' &&
    longitude !== 'undefined'
  ) {
    return { latitude, longitude };
  }
  return undefined;
}
