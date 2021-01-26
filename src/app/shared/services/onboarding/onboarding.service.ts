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

  async isOnboarding() {
    return this.preferences.getBoolean(PrefKeys.IS_ONBOARDING, true);
  }

  async onboard() {
    return this.preferences.setBoolean(PrefKeys.IS_ONBOARDING, false);
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
}

const enum PrefKeys {
  IS_ONBOARDING = 'IS_ONBOARDING',
  HAS_PREFETCHED_DIA_BACKEND_ASSETS = 'HAS_PREFETCHED_DIA_BACKEND_ASSETS',
}
