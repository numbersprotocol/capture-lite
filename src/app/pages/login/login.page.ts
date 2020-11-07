import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { combineLatest } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BlockingActionService } from 'src/app/services/blocking-action/blocking-action.service';
import { NumbersStorageApi } from 'src/app/services/publisher/numbers-storage/numbers-storage-api.service';
import { EMAIL_REGEXP } from 'src/app/utils/validators';

@UntilDestroy()
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {

  readonly form = new FormGroup({});
  readonly model: LoginFormModel = { email: '', password: '' };
  fields: FormlyFieldConfig[] = [];

  constructor(
    private readonly blockingActionService: BlockingActionService,
    private readonly numbersStorageApi: NumbersStorageApi,
    private readonly toastController: ToastController,
    private readonly translocoService: TranslocoService,
    private readonly router: Router,
  ) {
    combineLatest([
      this.translocoService.selectTranslate('email'),
      this.translocoService.selectTranslate('password')
    ]).pipe(
      tap(([emailTranslation, passwordTranslation]) => this.createFormFields(emailTranslation, passwordTranslation)),
      untilDestroyed(this)
    ).subscribe();
  }

  private createFormFields(emailTranslation: string, passwordTranslation: string) {
    this.fields = [{
      key: 'email',
      type: 'input',
      templateOptions: {
        type: 'email',
        placeholder: emailTranslation,
        required: true,
        hideRequiredMarker: true,
        pattern: EMAIL_REGEXP
      },
      validation: {
        messages: {
          pattern: () => this.translocoService.translate('message.pleaseEnterValidEmail')
        }
      }
    }, {
      key: 'password',
      type: 'input',
      templateOptions: {
        type: 'password',
        placeholder: passwordTranslation,
        required: true,
        hideRequiredMarker: true,
        minLength: 8,
        maxLength: 32
      },
      validation: {
        messages: {
          minlength: (_, field: FormlyFieldConfig) => this.translocoService.translate(
            'message.passwordMustBeBetween',
            { min: field.templateOptions?.minLength, max: field.templateOptions?.maxLength }
          )
        }
      }
    }];
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
      err => this.toastController // replace with material component
        .create({
          message: this.translocoService.translate('message.emailOrPasswordIsInvalid'),
          duration: 4000,
          color: 'danger',
        })
        .then(toast => toast.present()),
    );
  }
}

interface LoginFormModel {
  email: string;
  password: string;
}
