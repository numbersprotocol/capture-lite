import { Component } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CapacitorProvider } from 'src/app/services/collector/information/capacitor-provider/capacitor-provider';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-defaultinformationprovider',
  templateUrl: './defaultinformationprovider.page.html',
  styleUrls: ['./defaultinformationprovider.page.scss'],
})
export class DefaultInformationProviderPage {

  readonly isDeviceInfoCollectionEnabled$ = CapacitorProvider.isDeviceInfoCollectionEnabled$();
  readonly isLocationInfoCollectionEnabled$ = CapacitorProvider.isLocationInfoCollectionEnabled$();

  setDeviceInfoCollection(enable: boolean) {
    CapacitorProvider.setDeviceInfoCollection$(enable).pipe(
      untilDestroyed(this)
    ).subscribe();
  }

  setLocationInfoCollection(enable: boolean) {
    CapacitorProvider.setLocationInfoCollection$(enable).pipe(
      untilDestroyed(this)
    ).subscribe();
  }
}
