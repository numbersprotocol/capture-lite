import { Plugins } from '@capacitor/core';
import { defer, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const { Storage } = Plugins;

export class Preferences {

  constructor(readonly name: string) { }

  get$<T>(key: string, defaultValue: T, converter: (str: string) => T = JSON.parse): Observable<T> {
    return defer(() => Storage.get({ key: `${name}_${key}` })).pipe(
      map(ret => ret.value),
      map(value => (value && value !== '[null]') ? converter(value) : defaultValue)
    );
  }

  getNumber(key: string, defaultValue: number) {
    return this.get$(key, defaultValue, Number);
  }

  getString(key: string, defaultValue: string) {
    return this.get$(key, defaultValue, (v) => v);
  }

  set$<T>(key: string, value: T, converter: (value: T) => string = JSON.stringify): Observable<T> {
    return defer(() => Storage.set({ key: `${name}_${key}`, value: converter(value) })).pipe(
      map(() => value)
    );
  }

  setNumber(key: string, value: number) {
    return this.set$(key, value, String);
  }

  setString(key: string, value: string) {
    return this.set$(key, value, (v) => v);
  }
}
