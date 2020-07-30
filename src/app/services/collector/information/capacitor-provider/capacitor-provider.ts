import { Plugins } from '@capacitor/core';
import { TranslocoService } from '@ngneat/transloco';
import { defer, Observable, zip } from 'rxjs';
import { map } from 'rxjs/operators';
import { Information } from 'src/app/services/data/information/information';
import { InformationRepository } from 'src/app/services/data/information/information-repository.service';
import { Proof } from 'src/app/services/data/proof/proof';
import { InformationProvider } from '../information-provider';

const { Device, Geolocation } = Plugins;

export class CapacitorProvider extends InformationProvider {

  readonly name = 'Capacitor';

  constructor(
    informationRepository: InformationRepository,
    private readonly translocoService: TranslocoService
  ) {
    super(informationRepository);
  }

  protected provide$(proof: Proof): Observable<Information[]> {
    return zip(
      defer(() => Device.getInfo()),
      defer(() => Device.getBatteryInfo()),
      defer(() => Device.getLanguageCode()),
      defer(() => Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        maximumAge: 10 * 60 * 1000,
        timeout: 10 * 1000
      }))
    ).pipe(
      map(([deviceInfo, batteryInfo, languageCode, geolocationPosition]) => {
        return [{
          proofHash: proof.hash,
          provider: this.name,
          name: this.translocoService.translate('deviceName'),
          value: String(deviceInfo.name)
        }, {
          proofHash: proof.hash,
          provider: this.name,
          name: this.translocoService.translate('deviceModel'),
          value: String(deviceInfo.model)
        }, {
          proofHash: proof.hash,
          provider: this.name,
          name: this.translocoService.translate('devicePlatform'),
          value: String(deviceInfo.platform)
        }, {
          proofHash: proof.hash,
          provider: this.name,
          name: this.translocoService.translate('uuid'),
          value: String(deviceInfo.uuid)
        }, {
          proofHash: proof.hash,
          provider: this.name,
          name: this.translocoService.translate('appVersion'),
          value: String(deviceInfo.appVersion)
        }, {
          proofHash: proof.hash,
          provider: this.name,
          name: this.translocoService.translate('appVersionCode'),
          value: String(deviceInfo.appBuild)
        }, {
          proofHash: proof.hash,
          provider: this.name,
          name: this.translocoService.translate('operatingSystem'),
          value: String(deviceInfo.operatingSystem)
        }, {
          proofHash: proof.hash,
          provider: this.name,
          name: this.translocoService.translate('osVersion'),
          value: String(deviceInfo.osVersion)
        }, {
          proofHash: proof.hash,
          provider: this.name,
          name: this.translocoService.translate('deviceManufacturer'),
          value: String(deviceInfo.manufacturer)
        }, {
          proofHash: proof.hash,
          provider: this.name,
          name: this.translocoService.translate('runningOnVm'),
          value: String(deviceInfo.isVirtual)
        }, {
          proofHash: proof.hash,
          provider: this.name,
          name: this.translocoService.translate('usedMemory'),
          value: String(deviceInfo.memUsed)
        }, {
          proofHash: proof.hash,
          provider: this.name,
          name: this.translocoService.translate('freeDiskSpace'),
          value: String(deviceInfo.diskFree)
        }, {
          proofHash: proof.hash,
          provider: this.name,
          name: this.translocoService.translate('totalDiskSpace'),
          value: String(deviceInfo.diskTotal)
        }, {
          proofHash: proof.hash,
          provider: this.name,
          name: this.translocoService.translate('batteryLevel'),
          value: String(batteryInfo.batteryLevel)
        }, {
          proofHash: proof.hash,
          provider: this.name,
          name: this.translocoService.translate('batteryCharging'),
          value: String(batteryInfo.isCharging)
        }, {
          proofHash: proof.hash,
          provider: this.name,
          name: this.translocoService.translate('deviceLanguageCode'),
          value: String(languageCode.value)
        }, {
          proofHash: proof.hash,
          provider: this.name,
          name: this.translocoService.translate('location'),
          value: `(${geolocationPosition.coords.latitude}, ${geolocationPosition.coords.longitude})`
        }];
      })
    );
  }
}
