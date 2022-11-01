import { Component } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { defer, iif, Subject } from 'rxjs';
import {
  catchError,
  concatMap,
  concatMapTo,
  count,
  take,
  tap,
} from 'rxjs/operators';
import { BlockingActionService } from '../../shared/blocking-action/blocking-action.service';
import { ConfirmAlert } from '../../shared/confirm-alert/confirm-alert.service';
import { Database } from '../../shared/database/database.service';
import { DiaBackendAuthService } from '../../shared/dia-backend/auth/dia-backend-auth.service';
import { ErrorService } from '../../shared/error/error.service';
import { LanguageService } from '../../shared/language/service/language.service';
import { MediaStore } from '../../shared/media/media-store/media-store.service';
import { PreferenceManager } from '../../shared/preference-manager/preference-manager.service';
import { reloadApp } from '../../utils/miscellaneous';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage {
  readonly langauges = this.languageService.languages;

  readonly currentLanguageKey$ = this.languageService.currentLanguageKey$;

  readonly hiddenOptionClicks$ = new Subject<void>();
  private readonly requiredClicks = 7;
  showHiddenOption = false;

  constructor(
    private readonly languageService: LanguageService,
    private readonly database: Database,
    private readonly preferenceManager: PreferenceManager,
    private readonly mediaStore: MediaStore,
    private readonly blockingActionService: BlockingActionService,
    private readonly errorService: ErrorService,
    private readonly translocoService: TranslocoService,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly confirmAlert: ConfirmAlert
  ) {}

  ionViewDidEnter() {
    this.hiddenOptionClicks$
      .pipe(
        take(this.requiredClicks),
        count(),
        tap(() => {
          this.showHiddenOption = true;
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  async setCurrentLanguage(event: Event) {
    const customEvent = event as CustomEvent<HTMLIonSelectElement>;
    return this.languageService.setCurrentLanguage(customEvent.detail.value);
  }

  public onSettingsToolbarClicked() {
    this.hiddenOptionClicks$.next();
  }

  /**
   * // TODO: Integrate Storage Backend delete function after it's ready.
   * Delete user account from Storage Backend.
   */
  async deleteAccount() {
    const email: string = await this.diaBackendAuthService.getEmail();

    const action$ = this.diaBackendAuthService.deleteUser$(email).pipe(
      // logout
      concatMapTo(defer(() => this.mediaStore.clear())),
      concatMapTo(defer(() => this.database.clear())),
      concatMapTo(defer(() => this.preferenceManager.clear())),
      concatMapTo(defer(reloadApp)),
      catchError((err: unknown) => this.errorService.toastError$(err))
    );

    return defer(() =>
      this.confirmAlert.present({
        message: this.translocoService.translate('message.confirmDelete'),
      })
    )
      .pipe(
        concatMap(result =>
          iif(() => result, this.blockingActionService.run$(action$))
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }
}
