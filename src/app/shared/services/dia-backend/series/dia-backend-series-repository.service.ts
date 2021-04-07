import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { defer, throwError } from 'rxjs';
import { catchError, concatMap, pluck, switchMap } from 'rxjs/operators';
import { DiaBackendAuthService } from '../auth/dia-backend-auth.service';
import { NotFoundErrorResponse } from '../errors';
import { PaginatedResponse } from '../pagination';
import { BASE_URL } from '../secret';

@Injectable({
  providedIn: 'root',
})
export class DiaBackendSeriesRepository {
  private readonly fetchSeriesCount$ = this.fetch$({ limit: 1 }).pipe(
    pluck('count')
  );

  readonly fetchSeriesList$ = this.fetchSeriesCount$.pipe(
    switchMap(count => this.fetch$({ limit: count }))
  );

  constructor(
    private readonly httpClient: HttpClient,
    private readonly authService: DiaBackendAuthService
  ) {}

  fetchById$(id: string) {
    return this.read$(id);
  }

  private fetch$(options?: { limit?: number }) {
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers => {
        let params = new HttpParams();

        if (options?.limit !== undefined) {
          params = params.set('limit', `${options.limit}`);
        }
        return this.httpClient.get<PaginatedResponse<DiaBackendSeries>>(
          `${BASE_URL}/api/v2/series/`,
          { headers, params }
        );
      })
    );
  }

  private read$(id: string) {
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers =>
        this.httpClient.get<DiaBackendSeries>(
          `${BASE_URL}/api/v2/series/${id}/`,
          { headers }
        )
      ),
      catchError((err: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        if (err instanceof HttpErrorResponse && err.status === 404)
          return throwError(new NotFoundErrorResponse(err));
        return throwError(err);
      })
    );
  }
}

export interface DiaBackendSeries {
  readonly id: string;
  readonly collections: {
    readonly assets: {
      readonly id: string;
      readonly sharable_copy: string;
      readonly collected: boolean;
    }[];
  }[];
  readonly in_store: boolean | null;
  readonly cover_image: string | null;
}
