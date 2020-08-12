import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { LoadingOptions } from '@ionic/core';
import { defer, Observable } from 'rxjs';
import { switchMap, switchMapTo } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BlockingActionService {

  constructor(
    private readonly loadingController: LoadingController
  ) { }

  run$(action$: Observable<any>, opts: LoadingOptions) {
    return defer(() => this.loadingController.create(opts)).pipe(
      switchMap(loading => this._run$(action$, loading))
    );
  }

  private _run$(action$: Observable<any>, loading: HTMLIonLoadingElement) {
    return defer(() => loading.present()).pipe(
      switchMapTo(action$),
      switchMapTo(defer(() => loading.dismiss()))
    );
  }
}
