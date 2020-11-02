import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot,
} from '@angular/router';

import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
  NumbersStorageApi,
} from '../publisher/numbers-storage/numbers-storage-api.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuardService implements CanActivate {

  constructor(
    private readonly numbersStorageApi: NumbersStorageApi,
  ) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    if ('true' === next.queryParamMap.get('logout')) {
      return this.numbersStorageApi.logout$()
        .pipe(
          catchError(() => of(false)),
          map(logout => logout !== false),
        );
    } else {
      return of(true);
    }
  }
}
