import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { combineLatest, defer } from 'rxjs';
import { catchError, concatMap, concatMapTo, first, tap } from 'rxjs/operators';
import { BlockingActionService } from '../../shared/blocking-action/blocking-action.service';
import { DiaBackendAuthService } from '../../shared/dia-backend/auth/dia-backend-auth.service';
import { ErrorService } from '../../shared/error/error.service';
import { EMAIL_REGEXP } from '../../utils/validation';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage {
  form = new UntypedFormGroup({});

  model: SignupFormModel = {
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    referralCodeOptional: '',
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
      this.translocoService.selectTranslate('referralCodeOptional'),
    ])
      .pipe(
        tap(
          ([
            emailTranslation,
            usernameTranlation,
            passwordTranslation,
            confirmPasswordTranslation,
            referralCodeOptionalTranslation,
          ]) =>
            this.createFormFields(
              emailTranslation,
              usernameTranlation,
              passwordTranslation,
              confirmPasswordTranslation,
              referralCodeOptionalTranslation
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
    confirmPasswordTranslation: string,
    referralCodeOptionalTranslation: string
  ) {
    this.fields = [
      {
        validators: {
          fieldMatch: {
            expression: (control: UntypedFormGroup) => {
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
          referralCodeValidator: {
            expression: (control: UntypedFormGroup) => {
              const alphanumeric = /^[A-Z0-9]{6}$/g;
              const { referralCodeOptional } = control.value;

              if (referralCodeOptional?.length === 0) return true;
              if (referralCodeOptional?.match(alphanumeric)) return true;

              return false;
            },
            message: this.translocoService.translate(
              'message.invalidReferralCode'
            ),
            errorPath: 'referralCodeOptional',
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
          {
            key: 'referralCodeOptional',
            type: 'input',
            templateOptions: {
              type: 'text',
              placeholder: referralCodeOptionalTranslation,
              required: false,
              hideRequiredMarker: true,
            },
            expressionProperties: {
              'model.referralCodeOptional': 'model.referralCodeOptional',
            },
            parsers: [(value: any) => value?.toUpperCase()],
          },
        ],
      },
    ];
  }

  onSubmit() {
    const device$ = this.diaBackendAuthService.readDevice$();
    const createUser$ = device$.pipe(
      concatMap(([fcmToken, deviceInfo, device]) => {
        return this.diaBackendAuthService.createUser$(
          this.model.username,
          this.model.email,
          this.model.password,
          this.model.referralCodeOptional,
          {
            fcm_token: fcmToken,
            platform: deviceInfo.platform,
            device_identifier: device.identifier,
          }
        );
      })
    );
    const action$ = createUser$.pipe(
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
        return this.handleOnSubmitError(err);
      })
    );
    this.blockingActionService
      .run$(action$)
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  private handleOnSubmitError(err: unknown) {
    if (
      err instanceof HttpErrorResponse &&
      err.error.error?.type === 'duplicate_email'
    ) {
      return this.errorService.toastError$(
        this.translocoService.translate('error.diaBackend.duplicate_email')
      );
    }
    if (
      err instanceof HttpErrorResponse &&
      err.error.error?.type === 'duplicate_username'
    ) {
      return this.errorService.toastError$(
        this.translocoService.translate('error.diaBackend.duplicate_username')
      );
    }
    if (
      err instanceof HttpErrorResponse &&
      err.error.error?.type === 'invalid_referral_code'
    ) {
      return this.errorService.toastError$(
        this.translocoService.translate(
          'error.diaBackend.invalid_referral_code'
        )
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    if (err instanceof HttpErrorResponse && err.status === 401)
      return this.errorService.toastError$(
        this.translocoService.translate('error.diaBackend.untrusted_client')
      );
    return this.errorService.toastError$(err);
  }
}

interface SignupFormModel {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  referralCodeOptional: string;
}
