import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

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

interface LoginFormModel {
  email: string;
  password: string;
}
@UntilDestroy()
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  form = new FormGroup({});
  model: LoginFormModel = { email: '', password: '' };
  options: FormlyFormOptions = {};
  fields: FormlyFieldConfig[] = [];
  formInitialized = false;

  constructor(
    private readonly blockingActionService: BlockingActionService,
    private readonly numbersStorageApi: NumbersStorageApi,
    private readonly toastController: ToastController,
    private readonly translocoService: TranslocoService,
    private readonly router: Router,
  ) { }

  ngOnInit() {
    combineLatest([
      this.translocoService.selectTranslate('email'),
      this.translocoService.selectTranslate('password'),
    ]).pipe(
      untilDestroyed(this),
    ).subscribe(
      translations => {
        this.fields = this.createFormFields(translations);
        this.formInitialized = true;
      }
    );
  }

  onSubmit() {
    const action$ = this.numbersStorageApi.login$(this.model.email, this.model.password);
    this.blockingActionService.run$(
      action$,
      { message: this.translocoService.translate('message.pleaseWait') }
    ).pipe(
      untilDestroyed(this),
    ).subscribe(
      () => this.router.navigate(['storage'], { replaceUrl: true }),
      err => this.toastController
        .create({
          message: this.translocoService.translate('message.emailOrPasswordIsInvalid'),
          duration: 4000,
          color: 'danger',
        })
        .then(toast => toast.present()),
    );
  }

  private createFormFields(translations: string[]): FormlyFieldConfig[] {
    const [emailTranslation, passwordTranslation] = translations;
    const fields: FormlyFieldConfig[] = [
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
    ];
    return fields;
  }

}
