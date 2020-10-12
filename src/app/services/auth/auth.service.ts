import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  PreferenceManager,
} from 'src/app/utils/preferences/preference-manager';

const preference = PreferenceManager.NUMBERS_STORAGE_PUBLISHER_PREF;
const enum PrefKeys {
  Enabled = 'enabled',
  AuthToken = 'authToken',
  UserName = 'userName',
  Email = 'email'
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // The user is authenticated if the user have successfully login once.
  // No real authentication API call is made here since the user is allowed to use the App offline
  isAuthenticated$(): Observable<boolean> {
    return preference.getString$(PrefKeys.AuthToken)
      .pipe(
        tap(auth => console.log(auth)),
        map(authToken => authToken !== ''),
      );
  }
}
