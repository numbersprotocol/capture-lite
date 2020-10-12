import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
  ) { }

  canActivate(): Observable<boolean> {
    return this.auth.isAuthenticated$()
      .pipe(
        tap(isAuthenticated => {
          if (!isAuthenticated) {
            this.router.navigate(['login']);
          }
        }),
      );
  }
}
