import { Component, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { Action, Param } from '../service/actions.service';

@Component({
  selector: 'app-actions-dialog',
  templateUrl: './actions-dialog.component.html',
  styleUrls: ['./actions-dialog.component.scss'],
})
export class ActionsDialogComponent {
  readonly form = new FormGroup({});
  readonly fields: FormlyFieldConfig[] = [];
  readonly model: any = {};

  readonly title: string = '';
  readonly description: string = '';
  readonly params: Param[] = [];

  constructor(
    private readonly dialogRef: MatDialogRef<ActionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MatDialogData
  ) {
    if (data.action !== undefined && data.params !== undefined) {
      this.title = data.action.title_text;
      this.description = data.action.description_text;
      this.params = data.params;
      this.createFormModel();
      this.createFormFields();
    }
  }

  private createFormModel() {
    for (const param of this.params)
      this.model[param.name_text] =
        param?.default_values_list_text?.at(0) || '';
  }

  private createFormFields() {
    for (const param of this.params) {
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
            required: true,
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
            required: true,
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
            required: true,
          },
        });
    }
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
