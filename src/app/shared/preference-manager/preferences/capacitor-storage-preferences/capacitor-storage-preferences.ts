import { StoragePlugin } from '@capacitor/storage';
import { Mutex } from 'async-mutex';
import { isEqual } from 'lodash-es';
import { BehaviorSubject, defer, Observable } from 'rxjs';
import { concatMap, distinctUntilChanged } from 'rxjs/operators';
import { isNonNullable } from '../../../../utils/rx-operators/rx-operators';
import { Preferences } from '../preferences';

export class CapacitorStoragePreferences implements Preferences {
  private readonly subjects = new Map<string, BehaviorSubject<any>>();
  private readonly mutex = new Mutex();

  constructor(
    readonly id: string,
    private readonly storagePlugin: StoragePlugin
  ) {}

  getBoolean$(key: string, defaultValue = false) {
    return this.get$(key, defaultValue);
  }

  getNumber$(key: string, defaultValue = 0) {
    return this.get$(key, defaultValue);
  }

  getString$(key: string, defaultValue = '') {
    return this.get$(key, defaultValue);
  }

  get$(key: string, defaultValue: boolean): Observable<boolean>;
  get$(key: string, defaultValue: number): Observable<number>;
  get$(key: string, defaultValue: string): Observable<string>;
  get$(key: string, defaultValue: SupportedTypes): Observable<SupportedTypes> {
    return defer(() => this.initializeValue(key, defaultValue)).pipe(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      concatMap(() => this.subjects.get(key)!.asObservable()),
      isNonNullable(),
      distinctUntilChanged(isEqual)
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

  private async get(key: string, defaultValue: boolean): Promise<boolean>;
  private async get(key: string, defaultValue: number): Promise<number>;
  private async get(key: string, defaultValue: string): Promise<string>;
  private async get(
    key: string,
    defaultValue: SupportedTypes
  ): Promise<SupportedTypes> {
    await this.initializeValue(key, defaultValue);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, rxjs/no-subject-value
    return this.subjects.get(key)!.value;
  }

  private async initializeValue(key: string, defaultValue: SupportedTypes) {
    if (this.subjects.has(key)) {
      const subject$ = this.subjects.get(key);
      // eslint-disable-next-line rxjs/no-subject-value
      if (subject$?.value === undefined) {
        subject$?.next(defaultValue);
      }
      return;
    }
    const value = await this.loadValue(key, defaultValue);
    this.subjects.set(
      key,
      new BehaviorSubject<SupportedTypes | undefined>(value)
    );
  }

  private async loadValue(key: string, defaultValue: SupportedTypes) {
    const rawValue = (
      await this.storagePlugin.get({ key: this.toStorageKey(key) })
    ).value;
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

  async set(key: string, value: boolean): Promise<boolean>;
  async set(key: string, value: number): Promise<number>;
  async set(key: string, value: string): Promise<string>;
  async set(key: string, value: SupportedTypes): Promise<SupportedTypes> {
    return this.mutex.runExclusive(async () => {
      await this.storeValue(key, value);
      if (!this.subjects.has(key)) {
        this.subjects.set(
          key,
          new BehaviorSubject<SupportedTypes | undefined>(value)
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const subject$ = this.subjects.get(
        key
      )! as BehaviorSubject<SupportedTypes>;
      subject$.next(value);
      return value;
    });
  }

  private async storeValue(key: string, value: SupportedTypes) {
    return this.storagePlugin.set({
      key: this.toStorageKey(key),
      value: `${value}`,
    });
  }

  async clear() {
    for (const [key, subject$] of this.subjects) {
      await this.storagePlugin.remove({ key: this.toStorageKey(key) });
      subject$.next(undefined);
    }
    return this;
  }

  private toStorageKey(key: string) {
    return `${this.id}_${key}`;
  }
}

type SupportedTypes = boolean | number | string;
