import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { defer } from 'rxjs';
import { concatMap, pluck, switchMap } from 'rxjs/operators';
import { DiaBackendAuthService } from '../auth/dia-backend-auth.service';
import { PaginatedResponse } from '../pagination';
import { BASE_URL } from '../secret';

@Injectable({
  providedIn: 'root',
})
export class DiaBackendSeriesRepository {
  private readonly fetchCollectedSeriesCount$ = this.fetchAll$({
    limit: 1,
    collected: true,
  }).pipe(pluck('count'));

  readonly fetchCollectedSeriesList$ = this.fetchCollectedSeriesCount$.pipe(
    switchMap(count => this.fetchAll$({ limit: count, collected: true }))
  );

  constructor(
    private readonly httpClient: HttpClient,
    private readonly authService: DiaBackendAuthService
  ) {}

  fetchById$(id: string) {
    return this.read$(id);
  }

  fetchAll$(
    queryParams: {
      limit?: number;
      collected?: boolean;
      offset?: number;
    } = {}
  ) {
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers => {
        const params = new HttpParams({ fromObject: queryParams });
        return this.httpClient.get<PaginatedResponse<DiaBackendSeries>>(
          `${BASE_URL}/api/v3/series/`,
          { headers, params }
        );
      })
    );
  }

  private read$(id: string) {
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers =>
        this.httpClient.get<DiaBackendSeries>(
          `${BASE_URL}/api/v3/series/${id}/`,
          { headers }
        )
      )
    );
  }
}

export interface DiaBackendSeries {
  readonly id: string;
  readonly collections: {
    readonly assets: {
      readonly id: string;
      readonly cid: string;
      readonly asset_file_thumbnail: string;
      readonly collected: boolean;
    }[];
    readonly collection_type: string;
  }[];
  readonly in_store: boolean | null;
  readonly cover_image: string | null;
}
