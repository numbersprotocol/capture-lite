import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { combineLatest } from 'rxjs';
import {
  BlockingActionService,
} from 'src/app/services/blocking-action/blocking-action.service';
import {
  NumbersStorageApi,
} from 'src/app/services/publisher/numbers-storage/numbers-storage-api.service';

import { ToastController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';

interface SignupFormModel {
  email: string;
  password: string;
  repeatPassword: string;
}

interface MessageConfig {
  color: string;
  text: string;
}

@UntilDestroy()
@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  form = new FormGroup({});
  model: SignupFormModel = { email: '', password: '', repeatPassword: '' };
  options: FormlyFormOptions = {};
  fields: FormlyFieldConfig[] = [];
  formInitialized = false;

  constructor(
    private readonly blockingActionService: BlockingActionService,
    private readonly numbersStorageApi: NumbersStorageApi,
    private readonly toastController: ToastController,
    private readonly translocoService: TranslocoService,
  ) { }

  ngOnInit() {
    combineLatest([
      this.translocoService.selectTranslate('email'),
      this.translocoService.selectTranslate('password'),
      this.translocoService.selectTranslate('repeatPassword'),
    ]).pipe(
      untilDestroyed(this),
    ).subscribe(
      translations => {
        this.fields = this.createFormFields(translations);
        this.formInitialized = true;
      }
    );
  }

  onSubmit(model: SignupFormModel) {
    const defaultUsername = '';
    const action$ = this.numbersStorageApi.createUser$(defaultUsername, model.email, model.password);

    this.blockingActionService.run$(
      action$,
      { message: this.translocoService.translate('message.pleaseWait') }
    ).pipe(
      untilDestroyed(this),
    ).subscribe(
      () => {
        this.toastController
          .create({
            message: this.translocoService.translate('message.verificationEmailSent') +
              this.translocoService.translate('message.pleaseCheckYourEmail'),
            duration: 8000,
            color: 'primary',
          })
          .then(toast => toast.present());
        if (this?.options?.resetModel) {
          this.options.resetModel();
        }
      },
      // FIXME: The actual error type can't be determined from response. Fix this after API updates error messages.
      err => this.toastController
        .create({
          message: this.translocoService.translate('message.emailAlreadyExists'),
          duration: 4000,
          color: 'danger',
        })
        .then(toast => toast.present()));
  }

  private createFormFields(translations: string[]): FormlyFieldConfig[] {
    const [emailTranslation, passwordTranslation, repeatPasswordTranslation] = translations;
    const fields: FormlyFieldConfig[] = [{
      validators: {
        validation: [
          { name: 'fieldMatch', options: { errorPath: 'repeatPassword' } },
        ],
      },
      fieldGroup: [
        {
          key: 'email',
          type: 'input',
          templateOptions: {
            type: 'email',
            placeholder: emailTranslation,
            required: true,
            hideRequiredMarker: true,
            pattern: /(.+)@(.+){2,}\.(.+){2,}/,
          }
        },
        {
          key: 'password',
          type: 'input',
          templateOptions: {
            type: 'password',
            placeholder: passwordTranslation,
            required: true,
            hideRequiredMarker: true,
            minLength: 8,
            maxLength: 32,
          }
        },
        {
          key: 'repeatPassword',
          type: 'input',
          templateOptions: {
            type: 'password',
            placeholder: repeatPasswordTranslation,
            required: true,
            hideRequiredMarker: true,
          }
        },
      ]
    }
    ];
    return fields;
  }

}
