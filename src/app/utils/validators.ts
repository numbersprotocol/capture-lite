import { AbstractControl, ValidationErrors, Validators } from '@angular/forms';

export const emailValidators = [Validators.required, Validators.email];
export const passwordValidators = [Validators.required, Validators.minLength(8), forbiddenAllNumericValidator];

function forbiddenAllNumericValidator(control: AbstractControl): ValidationErrors | null {
  const isNumber = /^\d+$/.test(control.value);
  // tslint:disable-next-line: no-null-keyword
  return isNumber ? { allNumeric: { value: control.value } } : null;
}
