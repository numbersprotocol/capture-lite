import { Injectable } from '@angular/core';
import {
  GoogleLoginResponseOnline,
  SocialLogin,
} from '@capgo/capacitor-social-login';
import { from, Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import {
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID,
} from '../dia-backend/secret';

export interface SocialUser {
  idToken: string;
  provider: 'google';
}

@Injectable({
  providedIn: 'root',
})
export class SocialAuthService {
  private initialized = false;
  private initializing = false;

  // No dependencies needed for this service
  constructor() {
    // Empty constructor
  }

  private async initSocialAuth(): Promise<void> {
    // Prevent multiple initializations
    if (this.initialized || this.initializing) {
      return;
    }

    this.initializing = true;

    try {
      // Initialize the SocialLogin plugin with Google authentication credentials
      // For iOS, we use a specific iOS client ID
      // For Android and Web, we use the web client ID
      await SocialLogin.initialize({
        google: {
          iOSClientId: GOOGLE_IOS_CLIENT_ID,
          webClientId: GOOGLE_WEB_CLIENT_ID,
        },
      });
      this.initialized = true;
    } finally {
      this.initializing = false;
    }
  }

  /**
   * Method to ensure the service is initialized
   */
  ensureInitialized$(): Observable<void> {
    if (this.initialized) {
      return from(Promise.resolve());
    }
    return from(this.initSocialAuth());
  }

  signInWithGoogle$(): Observable<SocialUser> {
    return this.ensureInitialized$().pipe(
      mergeMap(() =>
        from(
          SocialLogin.login({
            provider: 'google',
            options: {
              scopes: ['email', 'profile'],
              forcePrompt: true,
              forceRefreshToken: true,
            },
          })
        )
      ),
      map(result => {
        const googleResult = result as {
          provider: 'google';
          result: GoogleLoginResponseOnline;
        };

        if (typeof googleResult.result.idToken !== 'string') {
          throw new Error(
            'Google authentication failed: Invalid or missing ID token'
          );
        }

        return {
          idToken: googleResult.result.idToken,
          provider: googleResult.provider,
        };
      })
    );
  }
}
