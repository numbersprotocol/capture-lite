import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, defer, merge } from 'rxjs';
import { concatMap, concatMapTo, pluck, tap } from 'rxjs/operators';
import { Tuple } from '../../database/table/table';
import { DiaBackendAuthService } from '../auth/dia-backend-auth.service';
import { BASE_URL } from '../secret';

@Injectable({
  providedIn: 'root',
})
export class DiaBackendContactRepository {
  private readonly _isFetching$ = new BehaviorSubject(false);
  private readonly fetchAllCache$ = new BehaviorSubject<DiaBackendContact[]>(
    []
  );

  constructor(
    private readonly httpClient: HttpClient,
    private readonly authService: DiaBackendAuthService
  ) {}

  isFetching$() {
    return this._isFetching$.asObservable();
  }

  getAll$() {
    return merge(this.fetchAll$(), this.fetchAllCache$.asObservable());
  }

  private fetchAll$() {
    return defer(async () => this._isFetching$.next(true)).pipe(
      concatMapTo(defer(() => this.authService.getAuthHeaders())),
      concatMap(headers =>
        this.httpClient.get<ListContactResponse>(
          `${BASE_URL}/api/v2/contacts/`,
          { headers }
        )
      ),
      pluck('results'),
      tap(contacts => this.fetchAllCache$.next(contacts)),
      tap(() => this._isFetching$.next(false))
    );
  }
}

interface DiaBackendContact extends Tuple {
  readonly contact_email: string;
  readonly contact_name: string;
}

interface ListContactResponse {
  readonly results: DiaBackendContact[];
}
