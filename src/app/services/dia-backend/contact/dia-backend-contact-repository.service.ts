import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { isEqual } from 'lodash';
import { defer, merge } from 'rxjs';
import {
  concatMap,
  distinctUntilChanged,
  pluck,
  switchMapTo,
} from 'rxjs/operators';
import { Database } from '../../database/database.service';
import { OnConflictStrategy, Tuple } from '../../database/table/table';
import { DiaBackendAuthService } from '../auth/dia-backend-auth.service';
import { BASE_URL } from '../secret';

@Injectable({
  providedIn: 'root',
})
export class DiaBackendContactRepository {
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

  private fetchAll$() {
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers =>
        this.httpClient.get<ListContactResponse>(
          `${BASE_URL}/api/v2/contacts/`,
          { headers }
        )
      ),
      pluck('results'),
      concatMap(contacts =>
        this.table.insert(contacts, OnConflictStrategy.IGNORE)
      )
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
