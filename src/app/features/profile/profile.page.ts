import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { defer, forkJoin, iif } from 'rxjs';
import { catchError, concatMap, concatMapTo } from 'rxjs/operators';
import { BlockingActionService } from '../../shared/blocking-action/blocking-action.service';
import { ConfirmAlert } from '../../shared/confirm-alert/confirm-alert.service';
import { Database } from '../../shared/database/database.service';
import { DiaBackendAuthService } from '../../shared/dia-backend/auth/dia-backend-auth.service';
import { ErrorService } from '../../shared/error/error.service';
import { MediaStore } from '../../shared/media/media-store/media-store.service';
import { PreferenceManager } from '../../shared/preference-manager/preference-manager.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {
  readonly username$ = this.diaBackendAuthService.username$;
  readonly email$ = this.diaBackendAuthService.email$;
  readonly phoneVerified$ = this.diaBackendAuthService.phoneVerified$;
  readonly emailVerified$ = this.diaBackendAuthService.emailVerified$;

  constructor(
    private readonly database: Database,
    private readonly preferenceManager: PreferenceManager,
    private readonly mediaStore: MediaStore,
    private readonly blockingActionService: BlockingActionService,
    private readonly errorService: ErrorService,
    private readonly translocoService: TranslocoService,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly confirmAlert: ConfirmAlert,
    private readonly alertController: AlertController,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ionViewWillEnter() {
    forkJoin([this.diaBackendAuthService.syncProfile$()])
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  async editUsername() {
    const alert = await this.alertController.create({
      header: this.translocoService.translate('editUsername'),
      inputs: [
        {
          name: 'username',
          type: 'text',
          value: await this.diaBackendAuthService.getUsername(),
        },
      ],
      buttons: [
        {
          text: this.translocoService.translate('cancel'),
          role: 'cancel',
        },
        {
          text: this.translocoService.translate('ok'),
          handler: value => this.updateUsername(value.username),
        },
      ],
    });
    return alert.present();
  }

  private updateUsername(username: string) {
    const action$ = this.diaBackendAuthService
      .updateUser$({ username })
      .pipe(catchError((err: unknown) => this.errorService.toastError$(err)));
    return this.blockingActionService
      .run$(action$)
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  async phoneVerification() {
    return this.router.navigate(['phone-verification'], {
      relativeTo: this.route,
    });
  }

  async emailVerification() {
    return this.router.navigate(['email-verification'], {
      relativeTo: this.route,
    });
  }

  logout() {
    const action$ = defer(() => this.mediaStore.clear()).pipe(
      concatMapTo(defer(() => this.database.clear())),
      concatMapTo(defer(() => this.preferenceManager.clear())),
      concatMapTo(defer(reloadApp)),
      catchError((err: unknown) => this.errorService.toastError$(err))
    );
    return defer(() =>
      this.confirmAlert.present({
        message: this.translocoService.translate('message.confirmLogout'),
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

  /**
   * // TODO: Integrate Storage Backend delete function after it's ready.
   * Delete user account from Storage Backend.
   */
  async delete() {
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

// Reload the app to force app to re-run the initialization in AppModule.
function reloadApp() {
  location.href = 'index.html';
}
