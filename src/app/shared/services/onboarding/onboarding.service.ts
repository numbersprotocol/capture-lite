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

  async hasShownTutorial() {
    return this.preferences.getBoolean(PrefKeys.HAS_SHOWN_TUTORIAL, false);
  }

  async setHasShownTutorial(value: boolean) {
    return this.preferences.setBoolean(PrefKeys.HAS_SHOWN_TUTORIAL, value);
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
  HAS_SHOWN_TUTORIAL = 'HAS_SHOWN_TUTORIAL',
  HAS_PREFETCHED_DIA_BACKEND_ASSETS = 'HAS_PREFETCHED_DIA_BACKEND_ASSETS',
}
