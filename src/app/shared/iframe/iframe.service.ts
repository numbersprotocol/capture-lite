import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { PreferenceManager } from '../preference-manager/preference-manager.service';

@Injectable({
  providedIn: 'root',
})
export class IframeService {
  readonly id = 'IframeService';

  private readonly preferences = this.preferenceManager.getPreferences(this.id);

  readonly exploreTabRefreshRequested$ = new BehaviorSubject(new Date());

  private readonly _exploreTabIframeNavigateBack$ = new ReplaySubject<boolean>(
    1
  );

  readonly exploreTabIframeNavigateBack$ =
    this._exploreTabIframeNavigateBack$.asObservable();

  readonly detailsPageIframeReloadRequested$ = this.preferences.getNumber$(
    PrefKeys.DETAILS_PAGE_RELOAD_REQUESTED_TIMESTAMP,
    0
  );

  constructor(private readonly preferenceManager: PreferenceManager) {}

  refreshExploreTabIframe() {
    this.exploreTabRefreshRequested$.next(new Date());
  }

  navigateBackExploreTabIframe() {
    this._exploreTabIframeNavigateBack$.next(true);
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
