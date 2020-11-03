import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { defer } from 'rxjs';
import { catchError, concatMapTo } from 'rxjs/operators';
import { BlockingActionService } from 'src/app/services/blocking-action/blocking-action.service';
import { NumbersStorageApi } from 'src/app/services/publisher/numbers-storage/numbers-storage-api.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {

  readonly userName$ = this.numbersStorageApi.getUserName$();
  readonly email$ = this.numbersStorageApi.getEmail$();

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly blockingActionService: BlockingActionService,
    private readonly toastController: ToastController,
    private readonly translocoService: TranslocoService,
    private readonly numbersStorageApi: NumbersStorageApi
  ) { }

  logout() {
    const action$ = this.numbersStorageApi.logout$().pipe(
      concatMapTo(defer(() => this.router.navigate(['/login']))),
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
