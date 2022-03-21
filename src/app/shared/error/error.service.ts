/* eslint-disable no-console */
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { EMPTY, TimeoutError } from 'rxjs';
import { concatMap, concatMapTo, first, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  constructor(
    private readonly translocoService: TranslocoService,
    private readonly toastController: ToastController
  ) {}

  toastError$<T = unknown>(error: T) {
    return this.translocoService
      .selectTranslateObject<{ [key: string]: string }>('error')
      .pipe(
        first(),
        map(
          ({
            validationError,
            authenticationError,
            notFoundError,
            serverInternalError,
            internetError,
            timeoutError,
            unknownError,
          }) => {
            if (typeof error === 'string') return error;
            if (error instanceof HttpErrorResponse) {
              if (error.status === HttpErrorCode.INVALID)
                return validationError;
              if (error.status === HttpErrorCode.AUTHENTICATION)
                return authenticationError;
              if (error.status === HttpErrorCode.NOT_FOUND)
                return notFoundError;
              if (error.status >= HttpErrorCode.INTERNAL)
                return serverInternalError;
              return internetError;
            }
            if (error instanceof TimeoutError) return timeoutError;
            if (error instanceof Error) return error.message;
            return unknownError;
          }
        ),
        concatMap(
          message =>
            new Promise<T>(resolve =>
              this.toastController
                .create({ message, duration: 2000, color: 'danger' })
                .then(toast => toast.present())
                .then(() => {
                  console.error(error);
                  resolve(error);
                })
            )
        ),
        concatMapTo(EMPTY)
      );
  }

  toastDiaBackendError$(err: unknown) {
    if (err instanceof HttpErrorResponse) {
      const errorType = err.error.error?.type;
      if (
        errorType === 'invalid_network_app_name' ||
        errorType === 'insufficient_fund' ||
        errorType === 'order_expired' ||
        errorType === 'unable_to_confirm_order' ||
        errorType === 'unpaid_num_exceed_threshold'
      )
        return this.toastError$(
          this.translocoService.translate(`error.diaBackend.${errorType}`)
        );
    }
    return this.toastError$(err);
  }
}

export enum HttpErrorCode {
  INVALID = 400,
  AUTHENTICATION = 401,
  NOT_FOUND = 404,
  INTERNAL = 500,
}
