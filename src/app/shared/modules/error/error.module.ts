import {
  APP_INITIALIZER,
  ErrorHandler,
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import { Router } from '@angular/router';
import * as Sentry from '@sentry/angular';

@NgModule()
export class ErrorModule {
  static forRoot(): ModuleWithProviders<ErrorModule> {
    return {
      ngModule: ErrorModule,
      providers: [
        {
          provide: ErrorHandler,
          useValue: Sentry.createErrorHandler(),
        },
        {
          provide: Sentry.TraceService,
          deps: [Router],
        },
        {
          provide: APP_INITIALIZER,
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          useFactory: () => () => {},
          deps: [Sentry.TraceService],
          multi: true,
        },
      ],
    };
  }
}
