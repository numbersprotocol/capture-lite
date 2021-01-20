import { Inject, Injectable, NgZone } from '@angular/core';
import { NetworkPlugin, NetworkStatus } from '@capacitor/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { NETOWRK_PLUGIN } from '../../core/capacitor-plugins/capacitor-plugins.module';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  private readonly _connected$ = new BehaviorSubject(true);
  readonly connected$ = this._connected$.pipe(distinctUntilChanged());

  constructor(
    @Inject(NETOWRK_PLUGIN)
    private readonly networkPlugin: NetworkPlugin,
    private readonly ngZone: NgZone
  ) {}

  async initialize() {
    const currentStatus = await this.networkPlugin.getStatus();
    this.updateNetworkStatus(currentStatus);
    this.networkPlugin.addListener('networkStatusChange', status => {
      this.ngZone.run(() => this.updateNetworkStatus(status));
    });
  }

  updateNetworkStatus(status: NetworkStatus) {
    this._connected$.next(status.connected);
  }
}
