import { Plugins } from '@capacitor/core';
import { TranslocoService } from '@ngneat/transloco';
import { defer, Observable, of, zip } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
import { Importance, Information, InformationType } from 'src/app/services/data/information/information';
import { InformationRepository } from 'src/app/services/data/information/information-repository.service';
import { Proof } from 'src/app/services/data/proof/proof';
import { PreferenceManager } from 'src/app/utils/preferences/preference-manager';
import { InformationProvider } from '../information-provider';

const { Device, Geolocation } = Plugins;

const preferences = PreferenceManager.CAPACITOR_PROVIDER_PREF;
const enum PrefKeys {
  CollectDeviceInfo = 'collectDeviceInfo',
  CollectLocationInfo = 'collectLocationInfo'
}

export class CapacitorProvider extends InformationProvider {

  static readonly ID = 'capacitor';
  readonly id = CapacitorProvider.ID;

  constructor(
    informationRepository: InformationRepository,
    private readonly translocoService: TranslocoService
  ) {
    super(informationRepository);
  }

  static isDeviceInfoCollectionEnabled$() {
    return preferences.getBoolean$(PrefKeys.CollectDeviceInfo, true);
  }

  static setDeviceInfoCollection$(enable: boolean) {
    return preferences.setBoolean$(PrefKeys.CollectDeviceInfo, enable);
  }

  static isLocationInfoCollectionEnabled$() {
    return preferences.getBoolean$(PrefKeys.CollectLocationInfo, true);
  }

  static setLocationInfoCollection$(enable: boolean) {
    return preferences.setBoolean$(PrefKeys.CollectLocationInfo, enable);
  }

  protected provide$(proof: Proof): Observable<Information[]> {
    return zip(
      CapacitorProvider.isDeviceInfoCollectionEnabled$(),
      CapacitorProvider.isLocationInfoCollectionEnabled$()
    ).pipe(
      first(),
      switchMap(([isDeviceInfoCollectionEnabled, isLocationInfoCollectionEnabled]) => zip(
        isDeviceInfoCollectionEnabled ? defer(() => Device.getInfo()) : of(undefined),
        isDeviceInfoCollectionEnabled ? defer(() => Device.getBatteryInfo()) : of(undefined),
        isDeviceInfoCollectionEnabled ? defer(() => Device.getLanguageCode()) : of(undefined),
        isLocationInfoCollectionEnabled ? defer(() => Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          maximumAge: 10 * 60 * 1000,
          timeout: 10 * 1000
        })) : of(undefined))),
      map(([deviceInfo, batteryInfo, languageCode, geolocationPosition]) => {
        const informationList: Information[] = [];
        if (deviceInfo !== undefined) {
          informationList.push({
            proofHash: proof.hash,
            provider: this.id,
            name: this.translocoService.translate('uuid'),
            value: String(deviceInfo.uuid),
            importance: Importance.High,
            type: InformationType.Other
          }, {
            proofHash: proof.hash,
            provider: this.id,
            name: this.translocoService.translate('deviceName'),
            value: String(deviceInfo.name),
            importance: Importance.Low,
            type: InformationType.Device
          }, {
            proofHash: proof.hash,
            provider: this.id,
            name: this.translocoService.translate('deviceModel'),
            value: String(deviceInfo.model),
            importance: Importance.Low,
            type: InformationType.Device
          }, {
            proofHash: proof.hash,
            provider: this.id,
            name: this.translocoService.translate('devicePlatform'),
            value: String(deviceInfo.platform),
            importance: Importance.Low,
            type: InformationType.Device
          }, {
            proofHash: proof.hash,
            provider: this.id,
            name: this.translocoService.translate('appVersion'),
            value: String(deviceInfo.appVersion),
            importance: Importance.Low,
            type: InformationType.Device
          }, {
            proofHash: proof.hash,
            provider: this.id,
            name: this.translocoService.translate('appVersionCode'),
            value: String(deviceInfo.appBuild),
            importance: Importance.Low,
            type: InformationType.Device
          }, {
            proofHash: proof.hash,
            provider: this.id,
            name: this.translocoService.translate('operatingSystem'),
            value: String(deviceInfo.operatingSystem),
            importance: Importance.Low,
            type: InformationType.Device
          }, {
            proofHash: proof.hash,
            provider: this.id,
            name: this.translocoService.translate('osVersion'),
            value: String(deviceInfo.osVersion),
            importance: Importance.Low,
            type: InformationType.Device
          }, {
            proofHash: proof.hash,
            provider: this.id,
            name: this.translocoService.translate('deviceManufacturer'),
            value: String(deviceInfo.manufacturer),
            importance: Importance.Low,
            type: InformationType.Device
          }, {
            proofHash: proof.hash,
            provider: this.id,
            name: this.translocoService.translate('runningOnVm'),
            value: String(deviceInfo.isVirtual),
            importance: Importance.Low,
            type: InformationType.Device
          }, {
            proofHash: proof.hash,
            provider: this.id,
            name: this.translocoService.translate('usedMemory'),
            value: String(deviceInfo.memUsed),
            importance: Importance.Low,
            type: InformationType.Device
          }, {
            proofHash: proof.hash,
            provider: this.id,
            name: this.translocoService.translate('freeDiskSpace'),
            value: String(deviceInfo.diskFree),
            importance: Importance.Low,
            type: InformationType.Device
          }, {
            proofHash: proof.hash,
            provider: this.id,
            name: this.translocoService.translate('totalDiskSpace'),
            value: String(deviceInfo.diskTotal),
            importance: Importance.Low,
            type: InformationType.Device
          });
        }
        if (batteryInfo !== undefined) {
          informationList.push({
            proofHash: proof.hash,
            provider: this.id,
            name: this.translocoService.translate('batteryLevel'),
            value: String(batteryInfo.batteryLevel),
            importance: Importance.Low,
            type: InformationType.Device
          }, {
            proofHash: proof.hash,
            provider: this.id,
            name: this.translocoService.translate('batteryCharging'),
            value: String(batteryInfo.isCharging),
            importance: Importance.Low,
            type: InformationType.Device
          });
        }
        if (languageCode !== undefined) {
          informationList.push({
            proofHash: proof.hash,
            provider: this.id,
            name: this.translocoService.translate('deviceLanguageCode'),
            value: String(languageCode.value),
            importance: Importance.Low,
            type: InformationType.Device
          });
        }
        if (geolocationPosition !== undefined) {
          informationList.push({
            proofHash: proof.hash,
            provider: this.id,
            name: this.translocoService.translate('location'),
            value: `(${geolocationPosition.coords.latitude}, ${geolocationPosition.coords.longitude})`,
            importance: Importance.High,
            type: InformationType.Location
          });
        }
        return informationList;
      })
    );
  }
}
