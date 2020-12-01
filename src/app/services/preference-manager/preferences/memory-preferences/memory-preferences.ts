import { BehaviorSubject, Observable } from 'rxjs';
import { Preferences } from '../preferences';

export class MemoryPreferences implements Preferences {
  private readonly subjects = new Map<string, BehaviorSubject<any>>();

  constructor(readonly id: string) {}

  getBoolean$(key: string, defaultValue = false) {
    return this.get$(key, defaultValue);
  }

  getNumber$(key: string, defaultValue = 0) {
    return this.get$(key, defaultValue);
  }

  getString$(key: string, defaultValue = '') {
    return this.get$(key, defaultValue);
  }

  get$<T extends boolean | number | string>(key: string, defaultValue: T) {
    this.initializeValue(key, defaultValue);
    // tslint:disable-next-line: no-non-null-assertion
    return this.subjects.get(key)!.asObservable() as Observable<T>;
  }

  async getBoolean(key: string, defaultValue = true) {
    return this.get(key, defaultValue);
  }
  async getNumber(key: string, defaultValue = 0) {
    return this.get(key, defaultValue);
  }
  async getString(key: string, defaultValue = '') {
    return this.get(key, defaultValue);
  }

  private get<T extends boolean | number | string>(
    key: string,
    defaultValue: T
  ) {
    this.initializeValue(key, defaultValue);
    // tslint:disable-next-line: no-non-null-assertion
    return this.subjects.get(key)!.value as T;
  }

  private initializeValue(
    key: string,
    defaultValue: boolean | number | string
  ) {
    if (!this.subjects.has(key)) {
      this.subjects.set(key, new BehaviorSubject(defaultValue));
    }
  }

  async setBoolean(key: string, value: boolean) {
    return this.set(key, value);
  }

  async setNumber(key: string, value: number) {
    return this.set(key, value);
  }

  async setString(key: string, value: string) {
    return this.set(key, value);
  }

  async set<T extends boolean | number | string>(key: string, value: T) {
    if (!this.subjects.has(key)) {
      this.subjects.set(key, new BehaviorSubject(value));
    }
    // tslint:disable-next-line: no-non-null-assertion
    const subject$ = this.subjects.get(key)! as BehaviorSubject<T>;
    subject$.next(value);
    return value;
  }

  async clear() {
    this.subjects.clear();
    return this;
  }
}
