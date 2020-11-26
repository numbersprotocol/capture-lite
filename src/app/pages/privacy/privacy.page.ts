import { Component } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CapacitorProvider } from '../../services/collector/facts/capacitor-provider/capacitor-provider';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.page.html',
  styleUrls: ['./privacy.page.scss'],
})
export class PrivacyPage {

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
