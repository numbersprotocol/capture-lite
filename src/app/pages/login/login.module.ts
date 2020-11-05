import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { FormlyFieldConfig, FormlyModule, FORMLY_CONFIG } from '@ngx-formly/core';
import { FormlyIonicModule } from '@ngx-formly/ionic';
import { LoginPageRoutingModule } from './login-routing.module';
import { LoginPage } from './login.page';

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
    LoginPageRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    FormlyModule.forRoot({ extras: { lazyRender: true } }),
    FormlyIonicModule,
  ],
  declarations: [LoginPage],
  providers: [{
    provide: FORMLY_CONFIG,
    multi: true,
    useFactory: registerValidationMessages,
    deps: [TranslocoService],
  }]
})
export class LoginPageModule { }
