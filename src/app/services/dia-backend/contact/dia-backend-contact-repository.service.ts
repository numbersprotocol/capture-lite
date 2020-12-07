import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { isEqual } from 'lodash';
import { BehaviorSubject, defer, merge, of } from 'rxjs';
import {
  concatMap,
  concatMapTo,
  distinctUntilChanged,
  pluck,
  switchMapTo,
  tap,
} from 'rxjs/operators';
import { Database } from '../../database/database.service';
import { OnConflictStrategy, Tuple } from '../../database/table/table';
import { DiaBackendAuthService } from '../auth/dia-backend-auth.service';
import { BASE_URL } from '../secret';

@Injectable({
  providedIn: 'root',
})
export class DiaBackendContactRepository {
  private readonly _isFetching$ = new BehaviorSubject(false);
  private readonly table = this.database.getTable<DiaBackendContact>(
    DiaBackendContactRepository.name
  );

  constructor(
    private readonly httpClient: HttpClient,
    private readonly database: Database,
    private readonly authService: DiaBackendAuthService
  ) {}

  getAll$() {
    return merge(this.fetchAll$(), this.table.queryAll$()).pipe(
      distinctUntilChanged(isEqual)
    );
  }

  invite$(email: string) {
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers =>
        this.httpClient.post<InviteContactResponse>(
          `${BASE_URL}/api/v2/contacts/invite/`,
          { email },
          { headers }
        )
      ),
      switchMapTo(this.fetchAll$())
    );
  }

  isFetching$() {
    return this._isFetching$.asObservable();
  }

  private fetchAll$() {
    return of(this._isFetching$.next(true)).pipe(
      concatMapTo(defer(() => this.authService.getAuthHeaders())),
      concatMap(headers =>
        this.httpClient.get<ListContactResponse>(
          `${BASE_URL}/api/v2/contacts/`,
          { headers }
        )
      ),
      pluck('results'),
      concatMap(contacts =>
        this.table.insert(contacts, OnConflictStrategy.IGNORE)
      ),
      tap(() => this._isFetching$.next(false))
    );
  }
}

interface DiaBackendContact extends Tuple {
  readonly contact: string | null;
  readonly fake_contact_email: string | null;
}

interface ListContactResponse {
  readonly results: DiaBackendContact[];
}

// tslint:disable-next-line: no-empty-interface
interface InviteContactResponse {}
