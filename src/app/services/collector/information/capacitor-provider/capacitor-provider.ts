import { Plugins } from '@capacitor/core';
import { TranslocoService } from '@ngneat/transloco';
import { defer, Observable, of, zip } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
import { Importance, Information, InformationType } from 'src/app/services/repositories/information/information';
import { InformationRepository } from 'src/app/services/repositories/information/information-repository.service';
import { ProofOld } from 'src/app/services/repositories/proof/old-proof';
import { PreferenceManager } from 'src/app/utils/preferences/preference-manager';
import { OldInformationProvider } from '../information-provider';

const { Device, Geolocation } = Plugins;

const preferences = PreferenceManager.CAPACITOR_PROVIDER_PREF;
const enum PrefKeys {
  CollectDeviceInfo = 'collectDeviceInfo',
  CollectLocationInfo = 'collectLocationInfo'
}

export class CapacitorProvider extends OldInformationProvider {

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

  protected provide$(proof: ProofOld): Observable<Information[]> {
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
            name: 'UUID',
            value: String(deviceInfo.uuid),
            importance: Importance.High,
            type: InformationType.Device
          }, {
            proofHash: proof.hash,
            provider: this.id,
            name: 'Device Name',
            value: String(deviceInfo.name),
            importance: Importance.Low,
            type: InformationType.Device
          }, {
            proofHash: proof.hash,
            provider: this.id,
            name: 'Device Model',
            value: String(deviceInfo.model),
            importance: Importance.Low,
            type: InformationType.Device
          }, {
            proofHash: proof.hash,
            provider: this.id,
            name: 'Device Platform',
            value: String(deviceInfo.platform),
            importance: Importance.Low,
            type: InformationType.Device
          }, {
            proofHash: proof.hash,
            provider: this.id,
            name: 'App Version',
            value: String(deviceInfo.appVersion),
            importance: Importance.Low,
            type: InformationType.Device
          }, {
            proofHash: proof.hash,
            provider: this.id,
            name: 'App VersionCode',
            value: String(deviceInfo.appBuild),
            importance: Importance.Low,
            type: InformationType.Device
          }, {
            proofHash: proof.hash,
            provider: this.id,
            name: 'Operating System',
            value: String(deviceInfo.operatingSystem),
            importance: Importance.Low,
            type: InformationType.Device
          }, {
            proofHash: proof.hash,
            provider: this.id,
            name: 'OS Version',
            value: String(deviceInfo.osVersion),
            importance: Importance.Low,
            type: InformationType.Device
          }, {
            proofHash: proof.hash,
            provider: this.id,
            name: 'Device Manufacturer',
            value: String(deviceInfo.manufacturer),
            importance: Importance.Low,
            type: InformationType.Device
          }, {
            proofHash: proof.hash,
            provider: this.id,
            name: 'Rrunning on VM',
            value: String(deviceInfo.isVirtual),
            importance: Importance.Low,
            type: InformationType.Device
          }, {
            proofHash: proof.hash,
            provider: this.id,
            name: 'Used Memory',
            value: String(deviceInfo.memUsed),
            importance: Importance.Low,
            type: InformationType.Device
          }, {
            proofHash: proof.hash,
            provider: this.id,
            name: 'Free Disk Space',
            value: String(deviceInfo.diskFree),
            importance: Importance.Low,
            type: InformationType.Device
          }, {
            proofHash: proof.hash,
            provider: this.id,
            name: 'Total Disk Space',
            value: String(deviceInfo.diskTotal),
            importance: Importance.Low,
            type: InformationType.Device
          });
        }
        if (batteryInfo !== undefined) {
          informationList.push({
            proofHash: proof.hash,
            provider: this.id,
            name: 'Battery Level',
            value: String(batteryInfo.batteryLevel),
            importance: Importance.Low,
            type: InformationType.Device
          }, {
            proofHash: proof.hash,
            provider: this.id,
            name: 'Battery Charging',
            value: String(batteryInfo.isCharging),
            importance: Importance.Low,
            type: InformationType.Device
          });
        }
        if (languageCode !== undefined) {
          informationList.push({
            proofHash: proof.hash,
            provider: this.id,
            name: 'Device Language Code',
            value: String(languageCode.value),
            importance: Importance.Low,
            type: InformationType.Device
          });
        }
        if (geolocationPosition !== undefined) {
          informationList.push({
            proofHash: proof.hash,
            provider: this.id,
            name: 'Current GPS Latitude',
            value: `${geolocationPosition.coords.latitude}`,
            importance: Importance.High,
            type: InformationType.Location
          }, {
            proofHash: proof.hash,
            provider: this.id,
            name: 'Current GPS Longitude',
            value: `${geolocationPosition.coords.longitude}`,
            importance: Importance.High,
            type: InformationType.Location
          });
        }
        return informationList;
      })
    );
  }
}
