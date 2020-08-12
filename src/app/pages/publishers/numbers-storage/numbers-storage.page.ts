import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { defer } from 'rxjs';
import { catchError, switchMapTo, tap } from 'rxjs/operators';
import { BlockingActionService } from 'src/app/services/blocking-action/blocking-action.service';
import { NumbersStorageApi } from 'src/app/services/publisher/numbers-storage/numbers-storage-api.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-numbers-storage',
  templateUrl: './numbers-storage.page.html',
  styleUrls: ['./numbers-storage.page.scss'],
})
export class NumbersStoragePage {

  constructor(
    private readonly router: Router,
    private readonly blockingActionService: BlockingActionService,
    private readonly toastController: ToastController,
    private readonly translocoService: TranslocoService,
    private readonly numbersStorageApi: NumbersStorageApi
  ) { }

  ionViewWillEnter() {
    this.numbersStorageApi.isEnabled$().pipe(
      tap(isEnabled => {
        // FIXME: do not know why ['login'] does not work
        if (!isEnabled) { this.router.navigate(['/publishers', 'numbers-storage', 'login']); }
      }),
      untilDestroyed(this)
    ).subscribe();
  }

  logout() {
    const action$ = this.numbersStorageApi.logout$().pipe(
      // FIXME: do not know why ['login'] does not work
      switchMapTo(defer(() => this.router.navigate(['/publishers', 'numbers-storage', 'login']))),
      catchError(err => this.toastController
        .create({ message: JSON.stringify(err.error), duration: 4000 })
        .then(toast => toast.present())
      )
    );
    this.blockingActionService.run$(
      action$,
      { message: this.translocoService.translate('talkingToTheServer') }
    ).pipe(
      untilDestroyed(this)
    ).subscribe();
  }
}
