import { Injectable } from '@angular/core';
import { PreferenceManager } from '../preference-manager/preference-manager.service';

@Injectable({
  providedIn: 'root',
})
export class OnboardingService {
  private readonly preferences = this.preferenceManager.getPreferences(
    OnboardingService.name
  );

  isNewLogin = false;

  constructor(private readonly preferenceManager: PreferenceManager) {}

  private async migrate() {
    if (await this.preferences.getBoolean(PrefKeys.HAS_MIGRATED, false)) {
      return;
    }
    // tslint:disable-next-line: deprecation
    const isOnboarding = await this.isOnboarding();
    if (!isOnboarding) {
      await this.onboard();
    } else {
      // tslint:disable-next-line: deprecation
      await this.setIsOnboarding(false);
    }
    await this.preferences.setBoolean(PrefKeys.HAS_MIGRATED, true);
  }

  /**
   * @deprecated use `getOnboardingTimestamp` instead
   */
  async isOnboarding() {
    // tslint:disable-next-line: deprecation
    return this.preferences.getBoolean(PrefKeys.IS_ONBOARDING, true);
  }

  async getOnboardingTimestamp() {
    await this.migrate();
    const timestamp = await this.preferences.getNumber(
      PrefKeys.ONBOARDING_TIMESTAMP,
      OnboardingService.UNKNOWN_ONBOARDING_TIMESTAMP
    );
    if (timestamp === OnboardingService.UNKNOWN_ONBOARDING_TIMESTAMP) {
      return undefined;
    }
    return timestamp;
  }

  async onboard() {
    return this.preferences.setNumber(
      PrefKeys.ONBOARDING_TIMESTAMP,
      Date.now()
    );
  }

  /**
   * @deprecated use `onboard` instead
   */
  async setIsOnboarding(value: boolean) {
    // tslint:disable-next-line: deprecation
    return this.preferences.setBoolean(PrefKeys.IS_ONBOARDING, value);
  }

  async hasPrefetchedDiaBackendAssets() {
    return this.preferences.getBoolean(
      PrefKeys.HAS_PREFETCHED_DIA_BACKEND_ASSETS,
      false
    );
  }

  async setHasPrefetchedDiaBackendAssets(value: boolean) {
    return this.preferences.setBoolean(
      PrefKeys.HAS_PREFETCHED_DIA_BACKEND_ASSETS,
      value
    );
  }

  private static readonly UNKNOWN_ONBOARDING_TIMESTAMP = 0;
}

const enum PrefKeys {
  /**
   * @deprecated: use `ONBOARDING_TIMESTAMP` instead
   */
  IS_ONBOARDING = 'IS_ONBOARDING',
  ONBOARDING_TIMESTAMP = 'ONBOARDING_TIMESTAMP',
  HAS_PREFETCHED_DIA_BACKEND_ASSETS = 'HAS_PREFETCHED_DIA_BACKEND_ASSETS',
  HAS_MIGRATED = 'HAS_MIGRATED',
}
