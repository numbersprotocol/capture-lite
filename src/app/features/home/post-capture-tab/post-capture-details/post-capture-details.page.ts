import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { ActionSheetController, NavController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { EMPTY, zip } from 'rxjs';
import { concatMap, first, map, shareReplay, switchMap } from 'rxjs/operators';
import {
  DiaBackendAsset,
  DiaBackendAssetRepository,
} from '../../../../shared/services/dia-backend/asset/dia-backend-asset-repository.service';
import { DiaBackendAuthService } from '../../../../shared/services/dia-backend/auth/dia-backend-auth.service';
import { OldDefaultInformationName } from '../../../../shared/services/repositories/proof/old-proof-adapter';
import { ShareService } from '../../../../shared/services/share/share.service';
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
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly imageSrc$ = this.diaBackendAsset$.pipe(
    switchMap(asset =>
      this.diaBackendAssetRepository.getAndCachePostCaptureImage$(asset)
    ),
    first(),
    map(blob => URL.createObjectURL(blob)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly location$ = this.diaBackendAsset$.pipe(
    map(diaBackendAsset => {
      const geolocation = getValidGeolocation(diaBackendAsset);
      if (geolocation) {
        return `${geolocation.latitude}, ${geolocation.longitude}`;
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
    private readonly navController: NavController
  ) {}

  back() {
    this.navController.back();
  }

  async openOptionsMenu() {
    const actionSheet = await this.actionSheetController.create({
      buttons: [
        {
          text: this.translocoService.translate('message.shareCapture'),
          handler: () => {
            this.share();
          },
        },
        {
          text: this.translocoService.translate('message.viewOnCaptureClub'),
          handler: () => {
            this.openCaptureClub();
          },
        },
        {
          text: this.translocoService.translate(
            'message.viewBlockchainCertificate'
          ),
          handler: () => {
            this.openCertificate();
          },
        },
        {
          text: this.translocoService.translate(
            'message.viewSupportingVideoOnIpfs'
          ),
          handler: () => {
            this.openIpfsSupportingVideo();
          },
        },
      ],
    });
    return actionSheet.present();
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
