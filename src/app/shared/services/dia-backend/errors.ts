import { HttpErrorResponse } from '@angular/common/http';

export class NotFoundErrorResponse extends Error {
  readonly name = NotFoundErrorResponse.name;

  constructor(readonly httpErrorResponse?: HttpErrorResponse) {
    super(httpErrorResponse?.message);
  }
}
