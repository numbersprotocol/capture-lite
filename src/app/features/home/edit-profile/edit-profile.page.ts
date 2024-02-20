import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, UntypedFormGroup } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { combineLatest, forkJoin } from 'rxjs';
import {
  catchError,
  first,
  map,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs/operators';
import { BlockingActionService } from '../../../shared/blocking-action/blocking-action.service';
import { DiaBackendAuthService } from '../../../shared/dia-backend/auth/dia-backend-auth.service';
import { ErrorService } from '../../../shared/error/error.service';
import { NetworkService } from '../../../shared/network/network.service';

@UntilDestroy()
@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage {
  readonly networkConnected$ = this.networkService.connected$;
  readonly username$ = this.diaBackendAuthService.username$;
  readonly avatar$ = this.diaBackendAuthService.avatar$.pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );
  readonly profile$ = this.diaBackendAuthService
    .readProfile$()
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));
  readonly description$ = this.profile$.pipe(
    map(profile => profile.description)
  );
  readonly background$ = this.profile$.pipe(
    map(profile => profile.profile_background_thumbnail)
  );
  readonly form = new UntypedFormGroup({});
  model: EditProfileFormModel = {
    username: '',
    description: '',
    profilePicture: undefined,
    profileBackground: undefined,
  };
  fields: FormlyFieldConfig[] = [];
  formIsReady = false;

  constructor(
    private readonly blockingActionService: BlockingActionService,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly networkService: NetworkService,
    private readonly translocoService: TranslocoService,
    private readonly errorService: ErrorService,
    private readonly navController: NavController
  ) {}

  ionViewDidEnter() {
    this.createFormFields();
    this.populateFormFields();
    this.formIsReady = true;
  }

  createFormFields() {
    combineLatest([
      this.translocoService.selectTranslate('home.editProfile.username'),
      this.translocoService.selectTranslate('home.editProfile.description'),
    ])
      .pipe(
        tap(([usernameTranslation, descriptionTranslation]) => {
          this.fields = [
            {
              key: 'username',
              type: 'input',
              templateOptions: {
                label: usernameTranslation,
                placeholder: usernameTranslation,
                appearance: 'outline',
              },
              validators: {
                username: {
                  expression: (c: FormControl) => /^.{1,21}$/.test(c.value),
                  message: () =>
                    this.translocoService.translate(
                      'home.editProfile.error.mustBeBetween',
                      { min: 1, max: 21 }
                    ),
                },
              },
            },
            {
              key: 'description',
              type: 'textarea',
              templateOptions: {
                label: descriptionTranslation,
                placeholder: descriptionTranslation,
                appearance: 'outline',
                rows: 4,
              },
              validators: {
                username: {
                  expression: (c: FormControl) => /^.{0,255}$/.test(c.value),
                  message: () =>
                    this.translocoService.translate(
                      'home.editProfile.error.mustBeBetween',
                      { min: 0, max: 255 }
                    ),
                },
              },
            },
            {
              key: 'profilePicture',
              type: 'input',
              hide: true,
            },
            {
              key: 'profileBackground',
              type: 'input',
              hide: true,
            },
          ];
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  populateFormFields() {
    combineLatest([this.username$, this.description$])
      .pipe(
        first(),
        tap(([username, description]) => {
          this.model = { ...this.model, username, description };
        })
      )
      .subscribe();
  }

  onProfileImageSelected(image: File) {
    this.model = { ...this.model, profilePicture: image };
    this.form.markAsDirty();
  }

  onProfileBackgroundSelected(image: File) {
    this.model = { ...this.model, profileBackground: image };
    this.form.markAsDirty();
  }

  async onSubmit() {
    const updateUserNameAction$ = this.blockingActionService
      .run$(
        this.diaBackendAuthService
          .updateUser$({ username: this.model.username })
          .pipe(
            catchError((err: unknown) => this.handleUpdateUsernameError$(err))
          )
      )
      .pipe(untilDestroyed(this));
    const updateProfileAction$ = this.blockingActionService
      .run$(
        this.diaBackendAuthService
          .updateProfile$({
            description: this.model.description,
            profilePicture: this.model.profilePicture,
            profileBackground: this.model.profileBackground,
          })
          .pipe(
            catchError((err: unknown) => this.handleUpdateProfileError(err))
          )
      )
      .pipe(
        switchMap(() => this.diaBackendAuthService.syncUser$()),
        untilDestroyed(this)
      );
    forkJoin([updateUserNameAction$, updateProfileAction$])
      .pipe(tap(() => this.navController.back()))
      .subscribe();
  }

  private handleUpdateUsernameError$(err: unknown) {
    if (err instanceof HttpErrorResponse) {
      const errorType = err.error.error?.type;
      if (errorType === 'duplicate_username') {
        return this.errorService.toastError$(
          this.translocoService.translate(`error.diaBackend.${errorType}`)
        );
      }
    }
    return this.errorService.toastError$(err);
  }

  private updateProfile() {
    const updateProfileAction$ = this.diaBackendAuthService
      .updateProfile$({
        description: this.model.description,
        profilePicture: this.model.profilePicture,
        profileBackground: this.model.profileBackground,
      })
      .pipe(catchError((err: unknown) => this.handleUpdateProfileError(err)));

    this.blockingActionService
      .run$(updateProfileAction$)
      .pipe(
        switchMap(() => this.diaBackendAuthService.syncUser$()),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private handleUpdateProfileError(err: unknown): any {
    return this.errorService.toastError$(err);
  }
}

interface EditProfileFormModel {
  username: string;
  description: string;
  profilePicture: File | undefined;
  profileBackground: File | undefined;
}
