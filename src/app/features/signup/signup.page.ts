import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { combineLatest, defer } from 'rxjs';
import { catchError, concatMapTo, first, tap } from 'rxjs/operators';
import { ErrorService } from '../../shared/modules/error/error.service';
import { BlockingActionService } from '../../shared/services/blocking-action/blocking-action.service';
import { DiaBackendAuthService } from '../../shared/services/dia-backend/auth/dia-backend-auth.service';
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
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly errorService: ErrorService,
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
    const action$ = this.diaBackendAuthService
      .createUser$(this.model.username, this.model.email, this.model.password)
      .pipe(
        first(),
        concatMapTo(
          defer(() =>
            this.router.navigate(
              [
                '/login',
                { email: this.model.email, password: this.model.password },
              ],
              { replaceUrl: true }
            )
          )
        ),
        catchError((err: unknown) => {
          // eslint-disable-next-line @typescript-eslint/no-magic-numbers
          if (err instanceof HttpErrorResponse && err.status === 401)
            return this.errorService.toastError$(
              this.translocoService.translate(
                'error.diaBackend.untrusted_client'
              )
            );
          return this.errorService.toastError$(err);
        })
      );

    this.blockingActionService
      .run$(action$)
      .pipe(untilDestroyed(this))
      .subscribe();
  }
}

interface SignupFormModel {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}
