import { Device, Geolocation } from '@capacitor/core';
import { TranslateService } from '@ngx-translate/core';
import { defer, Observable, zip } from 'rxjs';
import { map } from 'rxjs/operators';
import { Information } from 'src/app/services/data/information/information';
import { InformationRepository } from 'src/app/services/data/information/information-repository.service';
import { Proof } from 'src/app/services/data/proof/proof';
import { InformationProvider } from '../information-provider';

export class CapacitorProvider extends InformationProvider {

  readonly name = 'Capacitor';

  constructor(
    informationRepository: InformationRepository,
    private readonly translateService: TranslateService
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
          name: this.translateService.instant('deviceName'),
          value: String(deviceInfo.name)
        }, {
          proofHash: proof.hash,
          provider: this.name,
          name: this.translateService.instant('deviceModel'),
          value: String(deviceInfo.model)
        }, {
          proofHash: proof.hash,
          provider: this.name,
          name: this.translateService.instant('devicePlatform'),
          value: String(deviceInfo.platform)
        }, {
          proofHash: proof.hash,
          provider: this.name,
          name: this.translateService.instant('uuid'),
          value: String(deviceInfo.uuid)
        }, {
          proofHash: proof.hash,
          provider: this.name,
          name: this.translateService.instant('appVersion'),
          value: String(deviceInfo.appVersion)
        }, {
          proofHash: proof.hash,
          provider: this.name,
          name: this.translateService.instant('appVersionCode'),
          value: String(deviceInfo.appBuild)
        }, {
          proofHash: proof.hash,
          provider: this.name,
          name: this.translateService.instant('operatingSystem'),
          value: String(deviceInfo.operatingSystem)
        }, {
          proofHash: proof.hash,
          provider: this.name,
          name: this.translateService.instant('osVersion'),
          value: String(deviceInfo.osVersion)
        }, {
          proofHash: proof.hash,
          provider: this.name,
          name: this.translateService.instant('deviceManufacturer'),
          value: String(deviceInfo.manufacturer)
        }, {
          proofHash: proof.hash,
          provider: this.name,
          name: this.translateService.instant('runningOnVm'),
          value: String(deviceInfo.isVirtual)
        }, {
          proofHash: proof.hash,
          provider: this.name,
          name: this.translateService.instant('usedMemory'),
          value: String(deviceInfo.memUsed)
        }, {
          proofHash: proof.hash,
          provider: this.name,
          name: this.translateService.instant('freeDiskSpace'),
          value: String(deviceInfo.diskFree)
        }, {
          proofHash: proof.hash,
          provider: this.name,
          name: this.translateService.instant('totalDiskSpace'),
          value: String(deviceInfo.diskTotal)
        }, {
          proofHash: proof.hash,
          provider: this.name,
          name: this.translateService.instant('batteryLevel'),
          value: String(batteryInfo.batteryLevel)
        }, {
          proofHash: proof.hash,
          provider: this.name,
          name: this.translateService.instant('batteryCharging'),
          value: String(batteryInfo.isCharging)
        }, {
          proofHash: proof.hash,
          provider: this.name,
          name: this.translateService.instant('deviceLanguageCode'),
          value: String(languageCode.value)
        }, {
          proofHash: proof.hash,
          provider: this.name,
          name: this.translateService.instant('location'),
          value: `(${geolocationPosition.coords.latitude}, ${geolocationPosition.coords.longitude})`
        }];
      })
    );
  }
}
