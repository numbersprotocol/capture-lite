import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { combineLatest, defer, TimeoutError } from 'rxjs';
import { catchError, concatMap, concatMapTo, map, tap } from 'rxjs/operators';
import { BlockingActionService } from '../../shared/services/blocking-action/blocking-action.service';
import { ConfirmAlert } from '../../shared/services/confirm-alert/confirm-alert.service';
import { DiaBackendAuthService } from '../../shared/services/dia-backend/auth/dia-backend-auth.service';
import { OnboardingService } from '../../shared/services/onboarding/onboarding.service';
import { EMAIL_REGEXP } from '../../utils/validation';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  readonly form = new FormGroup({});
  readonly model: LoginFormModel = { email: '', password: '' };
  fields: FormlyFieldConfig[] = [];
  showResendEmailButton = false;

  constructor(
    private readonly blockingActionService: BlockingActionService,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly translocoService: TranslocoService,
    private readonly router: Router,
    private readonly snackbar: MatSnackBar,
    private readonly onboardingService: OnboardingService,
    private readonly route: ActivatedRoute,
    private readonly confirmAlert: ConfirmAlert,
    private readonly alertController: AlertController
  ) {
    this.createFormFields();
    this.attemptAutoLogin();
  }

  private createFormFields() {
    combineLatest([
      this.translocoService.selectTranslate('email'),
      this.translocoService.selectTranslate('password'),
    ])
      .pipe(
        tap(([emailTranslation, passwordTranslation]) => {
          this.fields = [
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
              key: 'password',
              type: 'input',
              templateOptions: {
                type: 'password',
                placeholder: passwordTranslation,
                required: true,
                hideRequiredMarker: true,
              },
            },
          ];
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private attemptAutoLogin() {
    this.route.paramMap
      .pipe(
        map(params => ({
          email: params.get('email'),
          password: params.get('password'),
        })),
        tap(({ email, password }) => {
          this.model.email = email ?? '';
          this.model.password = password ?? '';
          if (email && password) {
            this.onSubmit();
          }
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  onSubmit() {
    this.showResendEmailButton = false;
    const action$ = this.diaBackendAuthService
      .login$(this.model.email, this.model.password)
      .pipe(
        catchError((error: TimeoutError | HttpErrorResponse) => {
          this.showLoginErrorMessage(error);
          throw error;
        }),
        tap(_ => (this.onboardingService.isNewLogin = true))
      );
    this.blockingActionService
      .run$(action$, {
        message: this.translocoService.translate('message.pleaseWait'),
      })
      .pipe(untilDestroyed(this))
      .subscribe(() => this.router.navigate(['home'], { replaceUrl: true }));
  }

  resendEmail() {
    this.diaBackendAuthService
      .resendActivationEmail$(this.model.email)
      .pipe(
        catchError(err => {
          this.snackbar.open(
            this.translocoService.translate('error.loginNoEmailToActivate'),
            this.translocoService.translate('dismiss'),
            {
              duration: 4000,
              panelClass: ['snackbar-error'],
            }
          );
          throw err;
        }),
        untilDestroyed(this)
      )
      .subscribe(() => {
        this.snackbar.open(
          this.translocoService.translate('message.verificationEmailSent'),
          this.translocoService.translate('dismiss'),
          { duration: 4000 }
        );
      });
  }

  private showLoginErrorMessage(error: TimeoutError | HttpErrorResponse) {
    let message;
    if (error instanceof TimeoutError) {
      message = this.translocoService.translate('error.loginTimeoutError');
    } else if (error instanceof HttpErrorResponse) {
      if (error.error?.type === 'user_is_not_active') {
        message = this.translocoService.translate(
          'error.loginUserNotActiveError'
        );
        this.showResendEmailButton = true;
      } else {
        message = this.translocoService.translate(
          'error.loginHttpResponseError'
        );
      }
    } else {
      message = this.translocoService.translate('error.loginUnkownError');
    }
    this.snackbar.open(message, this.translocoService.translate('dismiss'), {
      duration: 4000,
      panelClass: ['snackbar-error'],
    });
  }

  async forgetPassword() {
    const alert = await this.alertController.create({
      header: this.translocoService.translate('forgetPassword'),
      message: this.translocoService.translate(
        'message.resetPasswordEnterEmail'
      ),
      inputs: [
        {
          name: 'email',
          label: this.translocoService.translate('email'),
          type: 'email',
        },
      ],
      buttons: [
        {
          text: this.translocoService.translate('ok'),
          handler: value => this.resetPassword(value.email),
        },
        { text: this.translocoService.translate('cancel'), role: 'cancel' },
      ],
    });

    return alert.present();
  }

  private resetPassword(email: string) {
    const action$ = defer(() =>
      this.diaBackendAuthService.resetPassword$(email)
    ).pipe(
      concatMapTo(
        defer(() =>
          this.alertController.create({
            header: this.translocoService.translate('resetPassword'),
            message: this.translocoService.translate(
              'message.resetPasswordEmailSent'
            ),
            buttons: [
              {
                text: this.translocoService.translate('ok'),
              },
            ],
          })
        )
      ),
      concatMap(alertElement => alertElement.present())
    );
    return defer(() => this.blockingActionService.run$(action$))
      .pipe(
        catchError(err => {
          this.snackbar.open(
            this.translocoService.translate('error.invalidEmail'),
            this.translocoService.translate('dismiss'),
            {
              duration: 4000,
              panelClass: ['snackbar-error'],
            }
          );
          throw err;
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }
}

interface LoginFormModel {
  email: string;
  password: string;
}
