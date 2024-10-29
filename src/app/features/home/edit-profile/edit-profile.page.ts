import { Component } from '@angular/core';
import { FormControl, UntypedFormGroup } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { combineLatest } from 'rxjs';
import { catchError, first, map, tap } from 'rxjs/operators';
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
  readonly profileName$ = this.diaBackendAuthService.profile$.pipe(
    map(profile => profile.display_name)
  );
  readonly description$ = this.diaBackendAuthService.profile$.pipe(
    map(profile => profile.description)
  );
  readonly avatar$ = this.diaBackendAuthService.profile$.pipe(
    map(profile => profile.profile_picture_thumbnail)
  );
  readonly background$ = this.diaBackendAuthService.profile$.pipe(
    map(profile => profile.profile_background_thumbnail)
  );
  readonly form = new UntypedFormGroup({});
  model: EditProfileFormModel = {
    profileName: '',
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
      this.translocoService.selectTranslate('home.editProfile.profileName'),
      this.translocoService.selectTranslate('home.editProfile.description'),
    ])
      .pipe(
        tap(([profileNameTranslation, descriptionTranslation]) => {
          this.fields = [
            {
              key: 'profileName',
              type: 'input',
              templateOptions: {
                label: profileNameTranslation,
                placeholder: profileNameTranslation,
                appearance: 'outline',
              },
              validators: {
                profileName: {
                  expression: (c: FormControl) => /^.{1,15}$/.test(c.value),
                  message: () =>
                    this.translocoService.translate(
                      'home.editProfile.error.mustBeBetween',
                      { min: 1, max: 15 }
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
                description: {
                  expression: (c: FormControl) => /^.{0,125}$/.test(c.value),
                  message: () =>
                    this.translocoService.translate(
                      'home.editProfile.error.mustBeBetween',
                      { min: 0, max: 125 }
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
    combineLatest([this.profileName$, this.description$])
      .pipe(
        first(),
        tap(([profileName, description]) => {
          this.model = { ...this.model, profileName, description };
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
    this.blockingActionService
      .run$(
        this.diaBackendAuthService
          .updateProfile$({
            profileName: this.model.profileName,
            description: this.model.description,
            profilePicture: this.model.profilePicture,
            profileBackground: this.model.profileBackground,
          })
          .pipe(
            catchError((err: unknown) => this.handleUpdateProfileError(err))
          )
      )
      .pipe(
        tap(() => this.navController.back()),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private handleUpdateProfileError(err: unknown): any {
    return this.errorService.toastError$(err);
  }
}

interface EditProfileFormModel {
  profileName: string;
  description: string;
  profilePicture: File | undefined;
  profileBackground: File | undefined;
}
