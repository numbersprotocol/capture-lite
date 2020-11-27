import { Plugins } from '@capacitor/core';
import { Mutex } from 'async-mutex';
import { BehaviorSubject, defer, Observable } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { Preferences } from '../preferences';

const { Storage } = Plugins;

export class CapacitorStoragePreferencesImpl implements Preferences {
  private readonly subjects = new Map<string, BehaviorSubject<any>>();
  private readonly mutex = new Mutex();

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
    return defer(() => this.initializeValue(key, defaultValue)).pipe(
      // tslint:disable-next-line: no-non-null-assertion
      concatMap(() => this.subjects.get(key)!.asObservable() as Observable<T>)
    );
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

  private async get<T extends boolean | number | string>(
    key: string,
    defaultValue: T
  ) {
    await this.initializeValue(key, defaultValue);
    // tslint:disable-next-line: no-non-null-assertion
    return this.subjects.get(key)!.value as T;
  }

  private async initializeValue(
    key: string,
    defaultValue: boolean | number | string
  ) {
    if (this.subjects.has(key)) {
      return;
    }
    const value = await this.loadValue(key, defaultValue);
    this.subjects.set(key, new BehaviorSubject(value));
  }

  private async loadValue(
    key: string,
    defaultValue: boolean | number | string
  ) {
    const rawValue = (await Storage.get({ key: this.toStorageKey(key) })).value;
    if (!rawValue) {
      return defaultValue;
    }
    if (typeof defaultValue === 'boolean') {
      return rawValue === 'true';
    }
    if (typeof defaultValue === 'number') {
      return Number(rawValue);
    }
    return rawValue;
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
    return this.withLock(async () => {
      await this.storeValue(key, value);
      if (!this.subjects.has(key)) {
        this.subjects.set(key, new BehaviorSubject(value));
      }
      // tslint:disable-next-line: no-non-null-assertion
      const subject$ = this.subjects.get(key)! as BehaviorSubject<T>;
      subject$.next(value);
      return value;
    });
  }

  private async storeValue(key: string, value: boolean | number | string) {
    return Storage.set({ key: this.toStorageKey(key), value: `${value}` });
  }

  async clear() {
    for (const key of this.subjects.keys()) {
      await Storage.remove({ key: this.toStorageKey(key) });
    }
    this.subjects.clear();
    return this;
  }

  private toStorageKey(key: string) {
    return `${this.id}_${key}`;
  }

  private async withLock<K>(action: () => Promise<K>) {
    const release = await this.mutex.acquire();
    try {
      // Await for the action to finish before releasing the lock.
      return await action();
    } finally {
      release();
    }
  }
}
