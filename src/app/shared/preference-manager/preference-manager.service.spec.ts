/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../shared-testing.module';
import { PreferenceManager } from './preference-manager.service';

describe('PreferenceManager', () => {
  let manager: PreferenceManager;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
    });
    manager = TestBed.inject(PreferenceManager);
  });

  it('should be created', () => expect(manager).toBeTruthy());

  it('should get new preference with new ID', () => {
    const id = 'newId';
    expect(manager.getPreferences(id)).toBeTruthy();
  });

  it('should get same preference with same ID', () => {
    const id = 'id';
    expect(manager.getPreferences(id)).toBe(manager.getPreferences(id));
  });

  it('should clear all preferences', async () => {
    const key = 'key';
    const defaultValue = 99;
    const preference1 = manager.getPreferences('id1');
    const preference2 = manager.getPreferences('id2');
    await preference1.setNumber(key, 1);
    await preference2.setNumber(key, 2);

    await manager.clear();

    expect(await preference1.getNumber(key, defaultValue)).toEqual(
      defaultValue
    );
    expect(await preference2.getNumber(key, defaultValue)).toEqual(
      defaultValue
    );
  });
});
