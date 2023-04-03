import { Injectable, NgZone } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { fromEvent } from 'rxjs';
import { mapTo, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AndroidBackButtonService {
  readonly androidBackButtonEvent$ = fromEvent(document, 'ionBackButton');

  constructor(private readonly zone: NgZone) {}

  closeMatDialog$<T>(dialogRef: MatDialogRef<T>, priority = 100) {
    return this.androidBackButtonEvent$.pipe(
      tap((event: any) =>
        event.detail.register(priority, () =>
          this.zone.run(() => dialogRef.close())
        )
      ),
      mapTo(dialogRef)
    );
  }

  /**
   *
   * @param callback to be run when android back button event is occured.
   * @param priority Ionic Framework uses something similar to a priority
   * queue to manage hardware back button handlers. The handler with the
   * largest priority value will be called first. Prioriy for navigatoin is 0.
   * By default `priority` param is set to 1 to override routing navigation (i.e. Angular Routing).
   *
   * To see complete list of priority list check out Ionic's official docs:
   * https://ionicframework.com/docs/developing/hardware-back-button#internal-framework-handlers
   *
   */
  overrideAndroidBackButtonBehavior$(callback: () => void, priority = 1) {
    return this.androidBackButtonEvent$.pipe(
      tap((event: any) => {
        event.detail.register(priority, () => {
          this.zone.run(() => callback());
        });
      })
    );
  }
}
