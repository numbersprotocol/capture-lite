// from Angular source code:
// https://github.com/angular/angular/blob/e96b3793852ebfd79a54a708363691b11818b4a0/packages/forms/src/validators.ts#L98
export const EMAIL_REGEXP =
  /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
export const TEL_REGEXP = /^\+[1-9]\d{1,14}$/;
export const VERIFICATION_CODE_REGEXP = /^[0-9]{6}$/;
