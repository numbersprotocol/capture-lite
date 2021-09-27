import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { combineLatest, timer } from 'rxjs';
import {
  catchError,
  finalize,
  first,
  map,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
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
                      type: 'text',
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
    const RESEND_COOLDOWN_TICKS = 60;
    const TICK_INTERVAL = 1000;
    const countdown$ = timer(0, TICK_INTERVAL).pipe(
      take(RESEND_COOLDOWN_TICKS),
      map(tick => RESEND_COOLDOWN_TICKS - tick - 1),
      tap(cooldown => (this.secondsRemained = cooldown)),
      finalize(() => (this.secondsRemained = 0))
    );
    const action$ = this.diaBackendAuthService
      .sendPhoneVerification$(this.phoneNumberModel.phoneNumber)
      .pipe(catchError((err: unknown) => this.errorService.toastError$(err)));
    return this.blockingActionService
      .run$(action$, {
        message: this.translocoService.translate('message.pleaseWait'),
      })
      .pipe(
        tap(() => (this.hasSentPhoneVerification = true)),
        switchMap(() => countdown$),
        untilDestroyed(this)
      )
      .subscribe();
  }

  onVerificationCodeFormSubmit() {
    const CLOSE_DELAY = 3000;
    const countdown$ = timer(CLOSE_DELAY).pipe(
      first(),
      finalize(() =>
        this.router.navigate(['..'], {
          relativeTo: this.route,
        })
      )
    );
    const action$ = this.diaBackendAuthService
      .verifyPhoneVerification$(
        this.phoneNumberModel.phoneNumber,
        this.verificationCodeModel.verificationCode
      )
      .pipe(catchError((err: unknown) => this.handleVerificationError$(err)));
    return this.blockingActionService
      .run$(action$, {
        message: this.translocoService.translate('message.pleaseWait'),
      })
      .pipe(
        tap(() =>
          this.snackBar.open(
            this.translocoService.translate('message.verificationSuccess')
          )
        ),
        switchMap(() => countdown$),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private handleVerificationError$(err: unknown) {
    if (err instanceof HttpErrorResponse) {
      const errorType = err.error.error?.type;
      if (
        errorType === 'phone_verification_failed' ||
        errorType === 'phone_verification_code_expired' ||
        errorType === 'throttled'
      )
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
