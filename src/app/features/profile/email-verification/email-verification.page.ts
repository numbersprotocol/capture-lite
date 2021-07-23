import { Component } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { timer } from 'rxjs';
import {
  catchError,
  concatMap,
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

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-email-verification',
  templateUrl: './email-verification.page.html',
  styleUrls: ['./email-verification.page.scss'],
})
export class EmailVerificationPage {
  hasSentEmailVerification = false;
  secondsRemained = 0;

  readonly emailVerified$ = this.diaBackendAuthService.emailVerified$;
  readonly email$ = this.diaBackendAuthService.email$;

  constructor(
    private readonly blockingActionService: BlockingActionService,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly errorService: ErrorService,
    private readonly translocoService: TranslocoService
  ) {}

  async sendEmailVerification() {
    const RESEND_COOLDOWN_TICKS = 60;
    const TICK_INTERVAL = 1000;
    const countdown$ = timer(0, TICK_INTERVAL).pipe(
      take(RESEND_COOLDOWN_TICKS),
      map(tick => RESEND_COOLDOWN_TICKS - tick - 1),
      tap(cooldown => (this.secondsRemained = cooldown)),
      finalize(() => (this.secondsRemained = 0))
    );
    const action$ = this.email$.pipe(
      first(),
      concatMap(email =>
        this.diaBackendAuthService.resendActivationEmail$(email)
      ),
      catchError((err: unknown) => this.errorService.toastError$(err))
    );
    return this.blockingActionService
      .run$(action$, {
        message: this.translocoService.translate('message.pleaseWait'),
      })
      .pipe(
        tap(() => (this.hasSentEmailVerification = true)),
        switchMap(() => countdown$),
        untilDestroyed(this)
      )
      .subscribe();
  }
}
