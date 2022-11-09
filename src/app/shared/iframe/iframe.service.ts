import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IframeService {
  readonly exploreTabRefreshRequested$ = new BehaviorSubject(new Date());

  refreshExploreTabIframe() {
    this.exploreTabRefreshRequested$.next(new Date());
  }
}
