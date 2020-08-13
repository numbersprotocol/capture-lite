import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { defer } from 'rxjs';
import { catchError, switchMapTo } from 'rxjs/operators';
import { BlockingActionService } from 'src/app/services/blocking-action/blocking-action.service';
import { NumbersStorageApi } from 'src/app/services/publisher/numbers-storage/numbers-storage-api.service';
import { emailValidators, passwordValidators } from 'src/app/utils/validators';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {

  readonly loginForm = this.formBuilder.group({
    email: ['', emailValidators],
    password: ['', passwordValidators]
  });

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly translocoService: TranslocoService,
    private readonly blockingActionService: BlockingActionService,
    private readonly toastController: ToastController,
    private readonly numbersStorageApi: NumbersStorageApi
  ) { }

  login() {
    const action$ = this.numbersStorageApi.login$(
      this.loginForm.get('email')?.value,
      this.loginForm.get('password')?.value
    ).pipe(
      switchMapTo(defer(() => this.router.navigate(['..'], { relativeTo: this.route }))),
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
