import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';
import { concatMap, first } from 'rxjs/operators';
import { PreferenceManager } from '../preference-manager/preference-manager.service';
import { VersionService } from '../version/version.service';

@Injectable({
  providedIn: 'root',
})
export class OnboardingService {
  private static readonly UNKNOWN_ONBOARDING_TIMESTAMP = 0;

  private readonly preferences =
    this.preferenceManager.getPreferences('OnboardingService');

  isNewLogin = false;

  constructor(
    private readonly preferenceManager: PreferenceManager,
    private readonly versionService: VersionService
  ) {}

  private async migrate() {
    if (await this.preferences.getBoolean(PrefKeys.HAS_MIGRATED, false)) {
      return;
    }
    const isOnboarding = await this.isOnboarding();
    if (!isOnboarding) {
      await this.onboard$();
    } else {
      await this.setIsOnboarding(false);
    }
    await this.preferences.setBoolean(PrefKeys.HAS_MIGRATED, true);
  }

  /**
   * @deprecated use `getOnboardingTimestamp` instead
   */
  async isOnboarding() {
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

  onboard$() {
    return forkJoin([
      this.preferences.setNumber(PrefKeys.ONBOARDING_TIMESTAMP, Date.now()),
      this.versionService.version$.pipe(
        first(),
        concatMap(version =>
          this.preferences.setString(
            PrefKeys.HAS_SHOWN_TUTORIAL_VERSION,
            version
          )
        )
      ),
    ]);
  }

  /**
   * @deprecated use `onboard` instead
   */
  async setIsOnboarding(value: boolean) {
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

  async hasShownTutorialVersion() {
    return this.preferences.getString(PrefKeys.HAS_SHOWN_TUTORIAL_VERSION, '');
  }
}

const enum PrefKeys {
  /**
   * @deprecated: use `ONBOARDING_TIMESTAMP` instead
   */
  IS_ONBOARDING = 'IS_ONBOARDING',
  ONBOARDING_TIMESTAMP = 'ONBOARDING_TIMESTAMP',
  HAS_PREFETCHED_DIA_BACKEND_ASSETS = 'HAS_PREFETCHED_DIA_BACKEND_ASSETS',
  HAS_MIGRATED = 'HAS_MIGRATED',
  HAS_SHOWN_TUTORIAL_VERSION = 'HAS_SHOWN_TUTORIAL_VERSION',
}
