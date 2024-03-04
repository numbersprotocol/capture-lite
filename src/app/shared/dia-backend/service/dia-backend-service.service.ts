import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { defer } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { calcDaysBetweenDates } from '../../../utils/date';
import { Tuple } from '../../database/table/table';
import { PreferenceManager } from '../../preference-manager/preference-manager.service';
import { DiaBackendAuthService } from '../auth/dia-backend-auth.service';
import { BASE_URL } from '../secret';

@Injectable({
  providedIn: 'root',
})
export class DiaBackendService {
  private readonly preferences =
    this.preferenceManager.getPreferences('DiaBackendService');

  constructor(
    private readonly httpClient: HttpClient,
    private readonly authService: DiaBackendAuthService,
    private readonly preferenceManager: PreferenceManager
  ) {}

  appInfo$() {
    return defer(() => this.authService.getAuthHeadersWithApiKey()).pipe(
      concatMap(headers =>
        this.httpClient.get<DiaBackendAppInfo>(
          `${BASE_URL}/api/v3/services/app-info/`,
          { headers }
        )
      )
    );
  }

  async postponedMoreThanOneDayAgo() {
    const timestamp = await this.getAppUpdatePromptTimestamp();

    const lastPostponedTime = new Date(timestamp);
    const currentTime = new Date(Date.now());

    return calcDaysBetweenDates(currentTime, lastPostponedTime) > 1;
  }

  async getAppUpdatePromptTimestamp() {
    return this.preferences.getNumber(
      PrefKeys.APP_UPDATE_PROMPT_TIMESTPAMP,
      0 // new Date(0) == Thu Jan 01 1970
    );
  }

  async setAppUpdatePromptTimestamp(timestamp: number) {
    return this.preferences.setNumber(
      PrefKeys.APP_UPDATE_PROMPT_TIMESTPAMP,
      timestamp
    );
  }
}

export interface DiaBackendAppInfo extends Tuple {
  readonly latest_app_version: string;
  readonly update_urgency: 'low' | 'high' | 'critical';
}

const enum PrefKeys {
  APP_UPDATE_PROMPT_TIMESTPAMP = 'APP_UPDATE_PROMPT_TIMESTPAMP',
}
