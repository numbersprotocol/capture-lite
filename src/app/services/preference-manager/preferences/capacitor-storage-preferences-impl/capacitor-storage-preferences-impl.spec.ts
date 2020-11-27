import { zip } from 'rxjs';
import { first } from 'rxjs/operators';
import { Preferences } from '../preferences';
import { CapacitorStoragePreferencesImpl } from './capacitor-storage-preferences-impl';

describe('MemoryPreferencesImpl', () => {
  let preferences: Preferences;
  const id = 'id';

  beforeEach(() => (preferences = new CapacitorStoragePreferencesImpl(id)));

  it('should be created', () => expect(preferences).toBeTruthy());

  it('should get the same ID set in constructor', () =>
    expect(preferences.id).toEqual(id));

  it('should get the default boolean Observable if not set previously', done => {
    const notExistedKey = 'unknown';
    const defaultValue = true;
    preferences.getBoolean$(notExistedKey, defaultValue).subscribe(result => {
      expect(result).toEqual(defaultValue);
      done();
    });
  });

  it('should get the default number Observable if not set previously', done => {
    const notExistedKey = 'unknown';
    const defaultValue = 999;
    preferences.getNumber$(notExistedKey, defaultValue).subscribe(result => {
      expect(result).toEqual(defaultValue);
      done();
    });
  });

  it('should get the default string Observable if not set previously', done => {
    const notExistedKey = 'unknown';
    const defaultValue = 'default';
    preferences.getString$(notExistedKey, defaultValue).subscribe(result => {
      expect(result).toEqual(defaultValue);
      done();
    });
  });

  it('should get the default boolean value if not set previously', async () => {
    const notExistedKey = 'unknown';
    const defaultValue = true;
    const bool = await preferences.getBoolean(notExistedKey, defaultValue);
    expect(bool).toEqual(defaultValue);
  });

  it('should get the default number value if not set previously', async () => {
    const notExistedKey = 'unknown';
    const defaultValue = 999;
    const num = await preferences.getNumber(notExistedKey, defaultValue);
    expect(num).toEqual(defaultValue);
  });

  it('should get the default string value if not set previously', async () => {
    const notExistedKey = 'unknown';
    const defaultValue = 'default';
    const str = await preferences.getString(notExistedKey, defaultValue);
    expect(str).toEqual(defaultValue);
  });

  it('should get the same boolean Observable set previously', async done => {
    const key = 'key';
    const value = true;
    await preferences.setBoolean(key, value);

    preferences.getBoolean$(key).subscribe(result => {
      expect(result).toEqual(value);
      done();
    });
  });

  it('should get the same number Observable set previously', async done => {
    const key = 'key';
    const value = 99;
    await preferences.setNumber(key, value);

    preferences.getNumber$(key).subscribe(result => {
      expect(result).toEqual(value);
      done();
    });
  });

  it('should get the same string Observable set previously', async done => {
    const key = 'key';
    const value = 'value';
    await preferences.setString(key, value);

    preferences.getString$(key).subscribe(result => {
      expect(result).toEqual(value);
      done();
    });
  });

  it('should get the same boolean value set previously', async () => {
    const key = 'key';
    const value = true;
    await preferences.setBoolean(key, value);

    const result = await preferences.getBoolean(key);
    expect(result).toEqual(value);
  });

  it('should get the same number value set previously', async () => {
    const key = 'key';
    const value = 99;
    await preferences.setNumber(key, value);

    const result = await preferences.getNumber(key);
    expect(result).toEqual(value);
  });

  it('should get the same string value set previously', async () => {
    const key = 'key';
    const value = 'value';
    await preferences.setString(key, value);

    const result = await preferences.getString(key);
    expect(result).toEqual(value);
  });

  it('should set boolean atomically', async done => {
    const key = 'key';
    const operationCount = 100;
    const lastBoolean = true;
    const booleans: boolean[] = [
      ...Array(operationCount - 1).fill(false),
      lastBoolean,
    ];

    await Promise.all(booleans.map(bool => preferences.setBoolean(key, bool)));

    preferences.getBoolean$(key).subscribe(result => {
      expect(result).toEqual(lastBoolean);
      done();
    });
  });

  it('should set number atomically', async done => {
    const key = 'key';
    const operationCount = 100;
    const lastNumber = -20;
    const numbers: number[] = [...Array(operationCount - 1).keys(), lastNumber];

    await Promise.all(numbers.map(n => preferences.setNumber(key, n)));

    preferences.getNumber$(key).subscribe(result => {
      expect(result).toEqual(lastNumber);
      done();
    });
  });

  it('should set string atomically', async done => {
    const key = 'key';
    const operationCount = 1000;
    const lastString = 'last';
    const strings: string[] = [
      ...`${Array(operationCount - 1).keys()}`,
      lastString,
    ];

    await Promise.all(strings.map(str => preferences.setString(key, str)));

    preferences.getString$(key).subscribe(result => {
      expect(result).toEqual(lastString);
      done();
    });
  });

  it('should remove all values after clear', async done => {
    const booleanKey = 'booleanKey';
    const booleanValue = true;
    const defaultBooleanValue = false;
    const numberKey = 'numberKey';
    const numberValue = 77;
    const defaultNumberValue = 55;
    const stringKey = 'stringKey';
    const stringValue = 'stringValue';
    const defaultStringValue = 'defaultStringValue';

    await preferences.setBoolean(booleanKey, booleanValue);
    await preferences.setNumber(numberKey, numberValue);
    await preferences.setString(stringKey, stringValue);

    await preferences.clear();

    zip(
      preferences.getBoolean$(booleanKey, defaultBooleanValue),
      preferences.getNumber$(numberKey, defaultNumberValue),
      preferences.getString$(stringKey, defaultStringValue)
    )
      .pipe(first())
      .subscribe(([booleanResult, numberResult, stringResult]) => {
        expect(booleanResult).toEqual(defaultBooleanValue);
        expect(numberResult).toEqual(defaultNumberValue);
        expect(stringResult).toEqual(defaultStringValue);
        done();
      });
  });
});
