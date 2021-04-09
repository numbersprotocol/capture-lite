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
  private readonly fetchCollectedSeriesCount$ = this.fetch$({
    limit: 1,
    collected: true,
  }).pipe(pluck('count'));

  readonly fetchCollectedSeriesList$ = this.fetchCollectedSeriesCount$.pipe(
    switchMap(count => this.fetch$({ limit: count, collected: true }))
  );

  constructor(
    private readonly httpClient: HttpClient,
    private readonly authService: DiaBackendAuthService
  ) {}

  fetchById$(id: string) {
    return this.read$(id);
  }

  private fetch$({
    limit,
    collected,
  }: {
    limit?: number;
    collected?: boolean;
  }) {
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers => {
        let params = new HttpParams();

        if (limit !== undefined) {
          params = params.set('limit', `${limit}`);
        }
        if (collected !== undefined) {
          params = params.set('collected', `${collected}`);
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
      readonly asset_file_thumbnail: string;
      readonly collected: boolean;
    }[];
  }[];
  readonly in_store: boolean | null;
  readonly cover_image: string | null;
}
