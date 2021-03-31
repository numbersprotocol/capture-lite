import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, defer, iif, of, Subject, throwError } from 'rxjs';
import {
  concatMap,
  concatMapTo,
  distinctUntilChanged,
  first,
  pluck,
  repeatWhen,
  tap,
} from 'rxjs/operators';
import { Tuple } from '../../database/table/table';
import { DiaBackendAuthService } from '../auth/dia-backend-auth.service';
import { NotFoundErrorResponse } from '../errors';
import { PaginatedResponse } from '../pagination';
import { BASE_URL } from '../secret';

@Injectable({
  providedIn: 'root',
})
export class DiaBackendContactRepository {
  private readonly _isFetching$ = new BehaviorSubject(false);

  readonly isFetching$ = this._isFetching$.pipe(distinctUntilChanged());

  private readonly contactsUpdated$ = new Subject<{ reason?: string }>();

  private readonly allCount$ = this.list$({ limit: 1 }).pipe(
    pluck('count'),
    repeatWhen(() => this.contactsUpdated$)
  );

  readonly all$ = this.allCount$.pipe(
    first(),
    concatMap(count => this.list$({ limit: count })),
    repeatWhen(() => this.contactsUpdated$)
  );

  constructor(
    private readonly httpClient: HttpClient,
    private readonly authService: DiaBackendAuthService
  ) {}

  fetchByEmail$(email: string) {
    return this.list$({ limit: 1, email }).pipe(
      concatMap(response =>
        iif(
          () => response.count > 0,
          of(response.results[0]),
          throwError(new NotFoundErrorResponse())
        )
      )
    );
  }

  deleteByEmail$(email: string) {
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers =>
        this.httpClient.post<ContactDeleteResponse>(
          `${BASE_URL}/api/v2/contacts/delete/`,
          { email },
          { headers }
        )
      ),
      tap(() => this.refresh({ reason: this.deleteByEmail$.name }))
    );
  }

  private list$({
    email,
    limit,
    offset,
  }: {
    email?: string;
    limit?: number;
    offset?: number;
  }) {
    return defer(async () => this._isFetching$.next(true)).pipe(
      concatMapTo(defer(() => this.authService.getAuthHeaders())),
      concatMap(headers => {
        let params = new HttpParams();

        if (offset !== undefined) {
          params = params.set('offset', `${offset}`);
        }
        if (limit !== undefined) {
          params = params.set('limit', `${limit}`);
        }
        if (email !== undefined) {
          params = params.set('email', `${email}`);
        }

        return this.httpClient.get<PaginatedResponse<DiaBackendContact>>(
          `${BASE_URL}/api/v2/contacts/`,
          { headers, params }
        );
      }),
      tap(() => this._isFetching$.next(false))
    );
  }

  /**
   * The reason argument is only for debugging purpose for code tracing.
   */
  refresh(options?: { reason?: string }) {
    this.contactsUpdated$.next({ reason: options?.reason });
  }
}

export interface DiaBackendContact extends Tuple {
  readonly contact_email: string;
  readonly contact_name: string;
  readonly contact_profile_picture_thumbnail: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ContactDeleteResponse {}
