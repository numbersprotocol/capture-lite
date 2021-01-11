import { Injectable } from '@angular/core';
import { PreferenceManager } from '../preference-manager/preference-manager.service';

@Injectable({
  providedIn: 'root',
})
export class OnboardingService {
  private readonly preferences = this.preferenceManager.getPreferences(
    OnboardingService.name
  );

  constructor(private readonly preferenceManager: PreferenceManager) {}

  async onboard() {
    return this.preferences.setBoolean(PrefKeys.IS_ONBOARDING, false);
  }

  async isOnboarding() {
    return this.preferences.getBoolean(PrefKeys.IS_ONBOARDING, true);
  }
}

const enum PrefKeys {
  IS_ONBOARDING = 'IS_ONBOARDING',
}
