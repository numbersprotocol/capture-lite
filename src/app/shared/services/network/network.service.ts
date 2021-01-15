import { Inject, Injectable } from '@angular/core';
import { NetworkPlugin, NetworkStatus } from '@capacitor/core';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NETOWRK_PLUGIN } from '../../core/capacitor-plugins/capacitor-plugins.module';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  private readonly networkChangeDebounceTime = 1000;
  private readonly _connected$ = new BehaviorSubject(true);
  readonly connected$ = this._connected$.pipe(
    debounceTime(this.networkChangeDebounceTime),
    distinctUntilChanged()
  );

  constructor(
    @Inject(NETOWRK_PLUGIN)
    private readonly networkPlugin: NetworkPlugin
  ) {}

  async initialize() {
    const currentStatus = await this.networkPlugin.getStatus();
    this.updateNetworkStatus(currentStatus);
    this.networkPlugin.addListener('networkStatusChange', status => {
      this.updateNetworkStatus(status);
    });
  }

  updateNetworkStatus(status: NetworkStatus) {
    this._connected$.next(status.connected);
  }
}
