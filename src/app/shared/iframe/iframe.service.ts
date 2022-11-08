import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IframeService {
  readonly exploreTabRefreshRequested$ = new BehaviorSubject(new Date());

  private readonly _exploreTabIframeNavigateBack$ = new ReplaySubject<boolean>(
    1
  );
  readonly exploreTabIframeNavigateBack$ =
    this._exploreTabIframeNavigateBack$.asObservable();

  refreshExploreTabIframe() {
    this.exploreTabRefreshRequested$.next(new Date());
  }

  navigateBackExploreTabIframe() {
    this._exploreTabIframeNavigateBack$.next(true);
  }
}
