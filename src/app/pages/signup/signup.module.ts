import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  AbstractControl, FormsModule, ReactiveFormsModule,
} from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import {
  FORMLY_CONFIG, FormlyFieldConfig, FormlyModule,
} from '@ngx-formly/core';
import { FormlyIonicModule } from '@ngx-formly/ionic';

import { SignupPageRoutingModule } from './signup-routing.module';
import { SignupPage } from './signup.page';

export function fieldMatchValidator(control: AbstractControl, translocoService: TranslocoService) {
  const { password, repeatPassword } = control.value;

  // avoid displaying the message error when values are empty
  if (!repeatPassword || !password) {
    return undefined;
  }

  if (repeatPassword === password) {
    return undefined;
  }

  return { fieldMatch: true };
}


export function registerValidationMessages(translocoService: TranslocoService) {
  return {
    validationMessages: [
      {
        name: 'pattern',
        message() {
          return translocoService.selectTranslate('message.pleaseEnterValidEmail');
        },
      },
      {
        name: 'minlength',
        message(_: any, fields: FormlyFieldConfig) {
          return translocoService.selectTranslate(
            'message.passwordMustBeBetween',
            { min: fields?.templateOptions?.minLength, max: fields?.templateOptions?.maxLength },
          );
        },
      },
      {
        name: 'maxlength',
        message(_: any, fields: FormlyFieldConfig) {
          return translocoService.selectTranslate(
            'message.passwordMustBeBetween',
            { min: fields?.templateOptions?.minLength, max: fields?.templateOptions?.maxLength },
          );
        },
      },
      {
        name: 'fieldMatch',
        message() {
          return translocoService.selectTranslate('message.passwordNotMatching');
        },
      }
    ]
  };
}

@NgModule({
  imports: [
    TranslocoModule,
    CommonModule,
    FormsModule,
    IonicModule,
    SignupPageRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    FormlyModule.forRoot({
      validators: [
        { name: 'fieldMatch', validation: fieldMatchValidator },
      ],
      extras: { lazyRender: true },
    }),
    FormlyIonicModule,
  ],
  declarations: [SignupPage],
  providers: [
    {
      provide: FORMLY_CONFIG,
      multi: true,
      useFactory: registerValidationMessages,
      deps: [TranslocoService],
    },
  ],
})
export class SignupPageModule { }
