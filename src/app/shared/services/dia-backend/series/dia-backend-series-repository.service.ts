// tslint:disable: no-magic-numbers
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { defer, Subject, throwError } from 'rxjs';
import { catchError, concatMap } from 'rxjs/operators';
import { DiaBackendAuthService } from '../auth/dia-backend-auth.service';
import { NotFoundErrorResponse } from '../errors';
import { BASE_URL } from '../secret';

@Injectable({
  providedIn: 'root',
})
export class DiaBackendSeriesRepository {
  private readonly postCapturesUpdated$ = new Subject<{ reason?: string }>();

  constructor(
    private readonly httpClient: HttpClient,
    private readonly authService: DiaBackendAuthService
  ) {}

  readSeries$() {
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers =>
        this.httpClient.get<DiaBackendSeries>(`${BASE_URL}/api/v2/series/`, {
          headers,
        })
      ),
      catchError((err: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        if (err instanceof HttpErrorResponse && err.status === 404) {
          return throwError(new NotFoundErrorResponse(err));
        }
        return throwError(err);
      })
    );
  }
}

export interface DiaBackendSeries {
  readonly id: string;
  readonly collections: string;
  readonly in_store: boolean | null | undefined;
  readonly owner: string;
  readonly owner_name: string;
  readonly type: string;
  readonly cover_image: string | null | undefined;
  readonly title: string;
  readonly collected: boolean;
  readonly description: string;
  readonly created_at: string;
  readonly updated_at: string;
}
