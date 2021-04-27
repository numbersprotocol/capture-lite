import { Injectable } from '@angular/core';
import { PreferenceManager } from '../../services/preference-manager/preference-manager.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorReportService {
  private readonly preferences = this.preferenceManager.getPreferences(
    'ErrorReportService'
  );

  readonly enabled$ = this.preferences.getBoolean$(PrefKeys.ENABLED);

  constructor(private readonly preferenceManager: PreferenceManager) {}

  async setEnabled(value: boolean) {
    return this.preferences.setBoolean(PrefKeys.ENABLED, value);
  }
}

const enum PrefKeys {
  ENABLED = 'ENABLED',
}
