import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { combineLatest } from 'rxjs';

import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormlyFieldConfig } from '@ngx-formly/core';

@UntilDestroy()
@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  form = new FormGroup({});
  model = {};
  fields: FormlyFieldConfig[] = [];
  formInitialized = false;

  constructor(
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

  onSubmit() {
    console.log(this.model);
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
