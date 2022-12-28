import { Component, Inject } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Platform } from '@ionic/angular';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { Action, Param } from '../service/actions.service';

@Component({
  selector: 'app-actions-dialog',
  templateUrl: './actions-dialog.component.html',
  styleUrls: ['./actions-dialog.component.scss'],
})
export class ActionsDialogComponent {
  readonly form = new UntypedFormGroup({});
  readonly fields: FormlyFieldConfig[] = [];
  readonly model: any = {};

  readonly title: string = '';
  readonly description: string = '';
  readonly params: Param[] = [];

  constructor(
    private readonly dialogRef: MatDialogRef<ActionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MatDialogData,
    private readonly platform: Platform
  ) {
    if (data.action !== undefined && data.params !== undefined) {
      this.title = data.action.title_text;
      this.description = data.action.description_text;
      this.params = data.params;
      this.createFormModel();
      this.createFormFields();
      this.autoFocusFirstFieldOnIOS();
    }
  }

  private createFormModel() {
    for (const param of this.params)
      this.model[param.name_text] = param.default_values_list_text[0] || '';
  }

  private createFormFields() {
    for (const param of this.params) {
      const isOptional = param.optional_boolean ?? false;

      if (param.type_text === 'dropdown')
        this.fields.push({
          key: param.name_text,
          type: 'select',
          templateOptions: {
            options: param.default_values_list_text.map(value => ({
              label: value,
              value: value,
            })),
            placeholder: param.placeholder_text,
            disabled: !param.user_input_boolean,
            required: !isOptional,
          },
        });
      else if (param.type_text === 'number')
        this.fields.push({
          key: param.name_text,
          type: 'input',
          templateOptions: {
            type: 'number',
            label: param.display_text_text,
            placeholder: param.placeholder_text,
            disabled: !param.user_input_boolean,
            max: param.max_number,
            min: param.min_number,
            required: !isOptional,
          },
        });
      else
        this.fields.push({
          key: param.name_text,
          type: 'input',
          templateOptions: {
            type: 'text',
            label: param.display_text_text,
            placeholder: param.placeholder_text,
            disabled: !param.user_input_boolean,
            required: !isOptional,
          },
        });
    }
  }

  /**
   * WORKAROUND: https://github.com/numbersprotocol/capture-lite/issues/2284
   * This workaround is specific to iOS.
   * Action dialog form fields are created using @ngx-formly.
   * On Android it auto-focuses on 1st field even if 1st field is prepopulated.
   * On iOS it focuses on field that is not prepopulated yet thus having
   * different behavior based on Platform. To unify behavior this methods
   * forces to focus on 1st field on iOS platform.
   * @returns
   */
  autoFocusFirstFieldOnIOS() {
    if (!this.platform.is('ios')) return;
    if (this.fields.length <= 0) return;
    if (
      this.fields[0].templateOptions?.type !== 'number' &&
      this.fields[0].templateOptions?.type !== 'text'
    )
      return;
    const autoFocusAfterMilliseconds = 700;
    setTimeout(() => (this.fields[0].focus = true), autoFocusAfterMilliseconds);
  }

  send() {
    this.dialogRef.close(this.model);
  }

  cancel() {
    this.dialogRef.close();
  }
}

interface MatDialogData {
  action: Action | undefined;
  params: Param[] | undefined;
}
