import { InjectionToken, Type } from '@angular/core';
import { Observable } from 'rxjs';

export interface Preferences {
  readonly id: string;
  getBoolean$(key: string, defaultValue?: boolean): Observable<boolean>;
  getNumber$(key: string, defaultValue?: number): Observable<number>;
  getString$(key: string, defaultValue?: string): Observable<string>;
  setBoolean(key: string, value: boolean): Promise<boolean>;
  setNumber(key: string, value: number): Promise<number>;
  setString(key: string, value: string): Promise<string>;
  clear(): Promise<Preferences>;
}

export const PREFERENCES_IMPL = new InjectionToken<Type<Preferences>>(
  'PREFERENCES_IMPL'
);
