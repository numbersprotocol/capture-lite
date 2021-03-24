import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, defer, Subject } from 'rxjs';
import {
  concatMap,
  concatMapTo,
  distinctUntilChanged,
  pluck,
  repeatWhen,
  tap,
} from 'rxjs/operators';
import { Tuple } from '../../database/table/table';
import { DiaBackendAuthService } from '../auth/dia-backend-auth.service';
import { PaginatedResponse } from '../pagination';
import { BASE_URL } from '../secret';

@Injectable({
  providedIn: 'root',
})
export class DiaBackendContactRepository {
  private readonly _isFetching$ = new BehaviorSubject(false);

  readonly isFetching$ = this._isFetching$.pipe(distinctUntilChanged());

  private readonly list$ = defer(async () => this._isFetching$.next(true)).pipe(
    concatMapTo(defer(() => this.authService.getAuthHeaders())),
    concatMap(headers =>
      this.httpClient.get<PaginatedResponse<DiaBackendContact>>(
        `${BASE_URL}/api/v2/contacts/`,
        { headers }
      )
    ),
    pluck('results'),
    tap(() => this._isFetching$.next(false))
  );

  private readonly contactsUpdated$ = new Subject<{ reason?: string }>();

  readonly all$ = this.list$.pipe(repeatWhen(() => this.contactsUpdated$));

  constructor(
    private readonly httpClient: HttpClient,
    private readonly authService: DiaBackendAuthService
  ) {}

  /**
   * The reason argument is only for debugging purpose for code tracing.
   */
  refresh(options?: { reason?: string }) {
    this.contactsUpdated$.next({ reason: options?.reason });
  }
}

interface DiaBackendContact extends Tuple {
  readonly contact_email: string;
  readonly contact_name: string;
  readonly contact_profile_picture_thumbnail: string | null;
}
