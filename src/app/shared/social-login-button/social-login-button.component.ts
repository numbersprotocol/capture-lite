import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, defer, Observable } from 'rxjs';
import { catchError, concatMap, tap } from 'rxjs/operators';
import { LanguageService } from '../../shared/language/service/language.service';
import { BlockingActionService } from '../blocking-action/blocking-action.service';
import { DiaBackendAuthService } from '../dia-backend/auth/dia-backend-auth.service';
import { ErrorService } from '../error/error.service';
import { OnboardingService } from '../onboarding/onboarding.service';
import { SocialAuthService } from '../social-auth/social-auth.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-social-login-button',
  templateUrl: './social-login-button.component.html',
  styleUrls: ['./social-login-button.component.scss'],
})
export class SocialLoginButtonComponent {
  @Input() buttonText = '';

  constructor(
    private readonly languageService: LanguageService,
    private readonly blockingActionService: BlockingActionService,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly socialAuthService: SocialAuthService,
    private readonly onboardingService: OnboardingService,
    private readonly errorService: ErrorService,
    private readonly router: Router,
    private readonly translocoService: TranslocoService
  ) {}

  /**
   * Login or register with Google
   */
  loginWithGoogle() {
    return this.socialAuthService
      .signInWithGoogle$()
      .pipe(
        concatMap(socialUser => {
          const action$ = defer(() => {
            return combineLatest([
              this.diaBackendAuthService.readDevice$(),
              this.languageService.currentLanguageKey$,
            ]).pipe(
              concatMap(([[fcmToken, deviceInfo, device], language]) =>
                this.diaBackendAuthService.signupWithGoogle$(
                  socialUser.idToken,
                  {
                    fcm_token: fcmToken,
                    platform: deviceInfo.platform,
                    device_identifier: device.identifier,
                  },
                  language
                )
              ),
              tap(_ => (this.onboardingService.isNewLogin = true)),
              catchError((err: unknown) => this.handleSocialLoginError$(err))
            );
          });

          return this.blockingActionService.run$(action$);
        }),
        concatMap(() => this.router.navigate(['home'], { replaceUrl: true })),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private handleSocialLoginError$(err: unknown): Observable<never> {
    if (err instanceof HttpErrorResponse) {
      const errorType = err.error.error?.type;
      if (
        errorType === 'user_is_not_active' ||
        errorType === 'authentication_failed'
      ) {
        return this.errorService.toastError$(
          this.translocoService.translate(`error.diaBackend.${errorType}`)
        );
      }
    }
    return this.errorService.toastError$(err);
  }
}
