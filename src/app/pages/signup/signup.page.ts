import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { combineLatest } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BlockingActionService } from '../../services/blocking-action/blocking-action.service';
import { NumbersStorageApi } from '../../services/publisher/numbers-storage/numbers-storage-api.service';
import { EMAIL_REGEXP } from '../../utils/validation';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage {
  form = new FormGroup({});
  model: SignupFormModel = {
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  };
  fields: FormlyFieldConfig[] = [];

  constructor(
    private readonly blockingActionService: BlockingActionService,
    private readonly numbersStorageApi: NumbersStorageApi,
    private readonly toastController: ToastController,
    private readonly translocoService: TranslocoService,
    private readonly router: Router
  ) {
    combineLatest([
      this.translocoService.selectTranslate('email'),
      this.translocoService.selectTranslate('username'),
      this.translocoService.selectTranslate('password'),
      this.translocoService.selectTranslate('confirmPassword'),
    ])
      .pipe(
        tap(
          ([
            emailTranslation,
            usernameTranlation,
            passwordTranslation,
            confirmPasswordTranslation,
          ]) =>
            this.createFormFields(
              emailTranslation,
              usernameTranlation,
              passwordTranslation,
              confirmPasswordTranslation
            )
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private createFormFields(
    emailTranslation: string,
    usernameTranlation: string,
    passwordTranslation: string,
    confirmPasswordTranslation: string
  ) {
    this.fields = [
      {
        validators: {
          fieldMatch: {
            expression: (control: FormGroup) => {
              const { password, confirmPassword } = control.value;
              return (
                confirmPassword === password ||
                // avoid displaying the message error when values are empty
                !confirmPassword ||
                !password
              );
            },
            message: this.translocoService.translate(
              'message.passwordNotMatching'
            ),
            errorPath: 'confirmPassword',
          },
        },
        fieldGroup: [
          {
            key: 'email',
            type: 'input',
            templateOptions: {
              type: 'email',
              placeholder: emailTranslation,
              required: true,
              hideRequiredMarker: true,
              pattern: EMAIL_REGEXP,
            },
            validation: {
              messages: {
                pattern: () =>
                  this.translocoService.translate(
                    'message.pleaseEnterValidEmail'
                  ),
              },
            },
          },
          {
            key: 'username',
            type: 'input',
            templateOptions: {
              type: 'text',
              placeholder: usernameTranlation,
              required: true,
              hideRequiredMarker: true,
            },
          },
          {
            key: 'password',
            type: 'input',
            templateOptions: {
              type: 'password',
              placeholder: passwordTranslation,
              required: true,
              hideRequiredMarker: true,
              minLength: 8,
              maxLength: 32,
            },
            validation: {
              messages: {
                minlength: (_, field: FormlyFieldConfig) =>
                  this.translocoService.translate(
                    'message.passwordMustBeBetween',
                    {
                      min: field.templateOptions?.minLength,
                      max: field.templateOptions?.maxLength,
                    }
                  ),
              },
            },
          },
          {
            key: 'confirmPassword',
            type: 'input',
            templateOptions: {
              type: 'password',
              placeholder: confirmPasswordTranslation,
              required: true,
              hideRequiredMarker: true,
            },
          },
        ],
      },
    ];
  }

  onSubmit() {
    const action$ = this.numbersStorageApi.createUser$(
      this.model.username,
      this.model.email,
      this.model.password
    );

    this.blockingActionService
      .run$(action$)
      .pipe(untilDestroyed(this))
      .subscribe(
        () => this.router.navigate(['/signup/finished'], { replaceUrl: true }),
        err => {
          // FIXME: The actual error type can't be determined from response. Fix this after API updates error messages.
          console.error(err);
          this.toastController
            .create({
              message: this.translocoService.translate(
                'message.emailAlreadyExists'
              ),
              duration: 4000,
              color: 'danger',
            })
            .then(toast => toast.present());
        }
      );
  }
}

interface SignupFormModel {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}
