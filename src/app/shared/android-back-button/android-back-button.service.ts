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
}
