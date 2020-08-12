import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage {

  readonly signUpForm = this.formBuilder.group({
    userName: ['', Validators.required],
    email: ['', emailValidators],
    password: ['', passwordValidators]
  });

  constructor(
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
    private readonly blockingActionService: BlockingActionService,
    private readonly toastController: ToastController,
    private readonly translocoService: TranslocoService,
    private readonly numbersStorageApi: NumbersStorageApi
  ) { }

  signUp() {
    const action$ = this.numbersStorageApi.createUser$(
      this.signUpForm.get('userName')?.value,
      this.signUpForm.get('email')?.value,
      this.signUpForm.get('password')?.value
    ).pipe(
      // FIXME: do not know why ['..'] does not work
      switchMapTo(defer(() => this.router.navigate(['/publishers', 'numbers-storage']))),
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
