import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { combineLatest, timer } from 'rxjs';
import { catchError, first, map, take, tap } from 'rxjs/operators';
import { BlockingActionService } from '../../../shared/blocking-action/blocking-action.service';
import { DiaBackendAuthService } from '../../../shared/dia-backend/auth/dia-backend-auth.service';
import { ErrorService } from '../../../shared/error/error.service';
import {
  TEL_REGEXP,
  VERIFICATION_CODE_REGEXP,
} from '../../../utils/validation';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-phone-verification',
  templateUrl: './phone-verification.page.html',
  styleUrls: ['./phone-verification.page.scss'],
})
export class PhoneVerificationPage {
  phoneNumberForm = new FormGroup({});
  phoneNumberModel: phoneNumberFormModel = { phoneNumber: '' };
  phoneNumberFields: FormlyFieldConfig[] = [];

  verificationCodeForm = new FormGroup({});
  verificationCodeModel: verificationCodeModel = { verificationCode: '' };
  verificationCodeFields: FormlyFieldConfig[] = [];

  readonly RESEND_INTERVAL: number = 60;
  hasSentPhoneVerification = false;
  secondsRemained = 0;

  readonly phoneVerified$ = this.diaBackendAuthService.phoneVerified$;

  constructor(
    private readonly blockingActionService: BlockingActionService,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly errorService: ErrorService,
    private readonly translocoService: TranslocoService,
    private readonly snackBar: MatSnackBar,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.createFormFields();
  }

  private createFormFields() {
    combineLatest([
      this.translocoService.selectTranslate('verification.enterPhoneNumber'),
      this.translocoService.selectTranslate('verification.phonePlaceHolder'),
      this.translocoService.selectTranslate(
        'verification.enterVerificationCode'
      ),
      this.translocoService.selectTranslate(
        'verification.verificationCodePlaceHolder'
      ),
    ])
      .pipe(
        tap(
          ([
            enterPhoneNumberTranslation,
            phonePlaceHolderTranslation,
            enterVerificationCodeTranslation,
            verificationCodePlaceHolderTranslation,
          ]) => {
            this.phoneNumberFields = [
              {
                fieldGroup: [
                  {
                    key: 'phoneNumber',
                    type: 'input',
                    templateOptions: {
                      label: enterPhoneNumberTranslation,
                      type: 'tel',
                      placeholder: phonePlaceHolderTranslation,
                      required: true,
                      pattern: TEL_REGEXP,
                    },
                  },
                ],
              },
            ];
            this.verificationCodeFields = [
              {
                fieldGroup: [
                  {
                    key: 'verificationCode',
                    type: 'input',
                    templateOptions: {
                      label: enterVerificationCodeTranslation,
                      type: 'tel',
                      placeholder: verificationCodePlaceHolderTranslation,
                      required: true,
                      pattern: VERIFICATION_CODE_REGEXP,
                    },
                  },
                ],
              },
            ];
          }
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }

  onPhoneNumberFormSubmit() {
    const ONE_SECOND = 1000;
    const action$ = this.diaBackendAuthService
      .sendPhoneVerification$(this.phoneNumberModel.phoneNumber)
      .pipe(
        catchError((err: unknown) => this.errorService.toastError$(err)),
        tap(() => {
          this.hasSentPhoneVerification = true;
          timer(0, ONE_SECOND)
            .pipe(
              take(this.RESEND_INTERVAL),
              map(i => this.RESEND_INTERVAL - i - 1)
            )
            .subscribe(val => {
              this.secondsRemained = val;
            });
        })
      );
    return this.blockingActionService
      .run$(action$, {
        message: this.translocoService.translate('message.pleaseWait'),
      })
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  onVerificationCodeFormSubmit() {
    const THREE_SECONDS = 3000;
    const action$ = this.diaBackendAuthService
      .verifyPhoneVerification$(
        this.phoneNumberModel.phoneNumber,
        this.verificationCodeModel.verificationCode
      )
      .pipe(
        catchError((err: unknown) => this.handleVerificationError$(err)),
        tap(() => {
          this.snackBar.open(
            this.translocoService.translate('message.verificationSuccess')
          );
          timer(THREE_SECONDS)
            .pipe(first())
            .subscribe(() => {
              return this.router.navigate(['..'], {
                relativeTo: this.route,
              });
            });
        })
      );
    return this.blockingActionService
      .run$(action$, {
        message: this.translocoService.translate('message.pleaseWait'),
      })
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  private handleVerificationError$(err: unknown) {
    if (err instanceof HttpErrorResponse) {
      const errorType = err.error.error?.type;
      if (errorType === 'phone_verification_failed')
        return this.errorService.toastError$(
          this.translocoService.translate(`error.diaBackend.${errorType}`)
        );
    }
    return this.errorService.toastError$(err);
  }
}

interface phoneNumberFormModel {
  phoneNumber: string;
}

interface verificationCodeModel {
  verificationCode: string;
}
