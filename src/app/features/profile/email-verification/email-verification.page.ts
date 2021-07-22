import { Component } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { defer, timer } from 'rxjs';
import { catchError, first, map, switchMap, take, tap } from 'rxjs/operators';
import { BlockingActionService } from '../../../shared/blocking-action/blocking-action.service';
import { DiaBackendAuthService } from '../../../shared/dia-backend/auth/dia-backend-auth.service';
import { ErrorService } from '../../../shared/error/error.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-email-verification',
  templateUrl: './email-verification.page.html',
  styleUrls: ['./email-verification.page.scss'],
})
export class EmailVerificationPage {
  hasSentEmailVerification = false;
  secondsRemained = 0;
  readonly RESEND_INTERVAL: number = 60;

  readonly emailVerified$ = this.diaBackendAuthService.emailVerified$;
  readonly email$ = this.diaBackendAuthService.email$;

  constructor(
    private readonly blockingActionService: BlockingActionService,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly errorService: ErrorService,
    private readonly translocoService: TranslocoService
  ) {}

  async sendEmailVerification() {
    const ONE_SECOND = 1000;
    const action$ = defer(() => this.email$).pipe(
      first(),
      switchMap(email =>
        this.diaBackendAuthService.resendActivationEmail$(email)
      ),
      catchError((err: unknown) => this.errorService.toastError$(err)),
      tap(() => {
        this.hasSentEmailVerification = true;
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
}
