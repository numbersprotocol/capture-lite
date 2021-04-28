import { Injectable } from '@angular/core';
import * as Sentry from '@sentry/angular';
import { Integrations } from '@sentry/tracing';
import { defer, iif } from 'rxjs';
import { concatMap, first } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { PreferenceManager } from '../../services/preference-manager/preference-manager.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorReportService {
  private readonly preferences = this.preferenceManager.getPreferences(
    'ErrorReportService'
  );

  readonly enabled$ = this.preferences.getBoolean$(PrefKeys.ENABLED);

  private hasInitialized = false;

  readonly initialize$ = this.enabled$.pipe(
    concatMap(enabled =>
      iif(
        () => enabled && !this.hasInitialized,
        defer(async () => {
          Sentry.init({
            dsn:
              'https://6a61a79f8db44a19a96b77dcd419bda6@o584909.ingest.sentry.io/5737363',
            integrations: [
              new Integrations.BrowserTracing({
                routingInstrumentation: Sentry.routingInstrumentation,
              }),
            ],

            // Set tracesSampleRate to 1.0 to capture 100%
            // of transactions for performance monitoring.
            tracesSampleRate: 0.5,
            enabled: environment.production,
            beforeSend: async event => {
              const enabled = await this.enabled$.pipe(first()).toPromise();
              if (enabled) return event;
              return null;
            },
          });
          this.hasInitialized = true;
        })
      )
    )
  );

  constructor(private readonly preferenceManager: PreferenceManager) {}

  async setEnabled(value: boolean) {
    return this.preferences.setBoolean(PrefKeys.ENABLED, value);
  }
}

const enum PrefKeys {
  ENABLED = 'ENABLED',
}
