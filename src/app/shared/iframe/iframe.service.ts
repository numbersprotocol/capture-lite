import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { startWith } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class IframeService {
  readonly exploreTabRefreshRequested$ = new BehaviorSubject(new Date());

  private readonly _detailsPageIframeReloadRequested$ = new BehaviorSubject(
    new Date()
  );

  readonly detailsPageIframeReloadRequested$ =
    this._detailsPageIframeReloadRequested$.pipe(startWith(false));

  refreshExploreTabIframe() {
    this.exploreTabRefreshRequested$.next(new Date());
  }

  refreshDetailsPageIframe() {
    this._detailsPageIframeReloadRequested$.next(new Date());
  }
}
