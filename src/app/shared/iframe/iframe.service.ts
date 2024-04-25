import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { PreferenceManager } from '../preference-manager/preference-manager.service';

@Injectable({
  providedIn: 'root',
})
export class IframeService {
  readonly id = 'IframeService';

  private readonly preferences = this.preferenceManager.getPreferences(this.id);

  readonly collectionTabRefreshRequested$ = new BehaviorSubject(new Date());

  private readonly _collectionTabIframeNavigateBack$ =
    new ReplaySubject<boolean>(1);

  readonly collectionTabIframeNavigateBack$ =
    this._collectionTabIframeNavigateBack$.asObservable();

  readonly detailsPageIframeReloadRequested$ = this.preferences.getNumber$(
    PrefKeys.DETAILS_PAGE_RELOAD_REQUESTED_TIMESTAMP,
    0
  );

  constructor(private readonly preferenceManager: PreferenceManager) {}

  refreshCollectionTabIframe() {
    this.collectionTabRefreshRequested$.next(new Date());
  }

  navigateBackCollectionTabIframe() {
    this._collectionTabIframeNavigateBack$.next(true);
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
