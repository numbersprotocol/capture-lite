import { Inject, Injectable, NgZone } from '@angular/core';
import { ConnectionStatus, NetworkPlugin } from '@capacitor/network';
import { defer, merge, ReplaySubject } from 'rxjs';
import { distinctUntilChanged, pluck } from 'rxjs/operators';
import { NETOWRK_PLUGIN } from '../capacitor-plugins/capacitor-plugins.module';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  private readonly status$ = new ReplaySubject<ConnectionStatus>(1);

  readonly connected$ = merge(
    defer(() => this.networkPlugin.getStatus()),
    this.status$
  ).pipe(pluck('connected'), distinctUntilChanged());

  constructor(
    @Inject(NETOWRK_PLUGIN)
    private readonly networkPlugin: NetworkPlugin,
    private readonly zone: NgZone
  ) {
    this.networkPlugin.addListener('networkStatusChange', status => {
      this.zone.run(() => this.status$.next(status));
    });
  }
}
