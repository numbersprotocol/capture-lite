import { Component } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { CapacitorFactsProvider } from '../../shared/services/collector/facts/capacitor-facts-provider/capacitor-facts-provider.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.page.html',
  styleUrls: ['./privacy.page.scss'],
})
export class PrivacyPage {
  readonly isDeviceInfoCollectionEnabled$ = this.capacitorFactsProvider
    .isDeviceInfoCollectionEnabled$;
  readonly isLocationInfoCollectionEnabled$ = this.capacitorFactsProvider
    .isGeolocationInfoCollectionEnabled$;

  constructor(
    private readonly capacitorFactsProvider: CapacitorFactsProvider
  ) {}

  async setDeviceInfoCollection(enable: boolean) {
    return this.capacitorFactsProvider.setDeviceInfoCollection(enable);
  }

  async setLocationInfoCollection(enable: boolean) {
    return this.capacitorFactsProvider.setGeolocationInfoCollection(enable);
  }
}
