import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NumbersStorageApi } from '../../services/publisher/numbers-storage/numbers-storage-api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private readonly router: Router,
    private readonly numbersStorageApi: NumbersStorageApi
  ) {}

  canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.numbersStorageApi.isEnabled$().pipe(
      map(isEnabled => {
        if (isEnabled) {
          return true;
        }
        return this.router.parseUrl('/login');
      })
    );
  }
}
