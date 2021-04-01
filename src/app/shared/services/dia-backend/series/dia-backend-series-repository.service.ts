import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { defer, throwError } from 'rxjs';
import { catchError, concatMap } from 'rxjs/operators';
import { DiaBackendAuthService } from '../auth/dia-backend-auth.service';
import { NotFoundErrorResponse } from '../errors';
import { PaginatedResponse } from '../pagination';
import { BASE_URL } from '../secret';

@Injectable({
  providedIn: 'root',
})
export class DiaBackendSeriesRepository {
  readonly fetchSeries$ = defer(() => this.authService.getAuthHeaders()).pipe(
    concatMap(headers =>
      this.httpClient.get<PaginatedResponse<DiaBackendSeries>>(
        `${BASE_URL}/api/v2/series/`,
        {
          headers,
        }
      )
    ),
    catchError((err: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      if (err instanceof HttpErrorResponse && err.status === 404) {
        return throwError(new NotFoundErrorResponse(err));
      }
      return throwError(err);
    })
  );

  constructor(
    private readonly httpClient: HttpClient,
    private readonly authService: DiaBackendAuthService
  ) {}
}

export interface DiaBackendSeries {
  readonly id: string;
  readonly collections: string;
  readonly in_store: boolean | null;
  readonly cover_image: string | null;
}
