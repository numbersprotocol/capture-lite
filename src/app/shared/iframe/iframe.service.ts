import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PreferenceManager } from '../preference-manager/preference-manager.service';

@Injectable({
  providedIn: 'root',
})
export class IframeService {
  readonly id = 'IframeService';

  private readonly preferences = this.preferenceManager.getPreferences(this.id);

  readonly exploreTabRefreshRequested$ = new BehaviorSubject(new Date());

  readonly detailsPageIframeReloadRequested$ = this.preferences.getNumber$(
    PrefKeys.DETAILS_PAGE_RELOAD_REQUESTED_TIMESTAMP,
    0
  );

  constructor(private readonly preferenceManager: PreferenceManager) {}

  refreshExploreTabIframe() {
    this.exploreTabRefreshRequested$.next(new Date());
  }

  refreshDetailsPageIframe() {
    this.preferences.setNumber(
      PrefKeys.DETAILS_PAGE_RELOAD_REQUESTED_TIMESTAMP,
      Date.now()
    );
  }
}

const enum PrefKeys {
  DETAILS_PAGE_RELOAD_REQUESTED_TIMESTAMP = 'DETAILS_PAGE_RELOAD_REQUESTED_TIMESTAMP',
}
