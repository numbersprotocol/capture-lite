// tslint:disable: no-unbound-method

import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocalNotificationsPlugin, Plugins } from '@capacitor/core';
import { TranslocoService } from '@ngneat/transloco';
import { of, throwError } from 'rxjs';
import { LOCAL_NOTIFICATIONS_PLUGIN } from '../../shared/capacitor-plugins/capacitor-plugins.module';
import { SharedTestingModule } from '../../shared/shared-testing.module';
import { NotificationItem } from './notification-item';

const { LocalNotifications } = Plugins;

describe('NotificationItem', () => {
  let item: NotificationItem;
  let localNotificationsPlugin: LocalNotificationsPlugin;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
      providers: [
        { provide: LOCAL_NOTIFICATIONS_PLUGIN, useValue: LocalNotifications },
      ],
    });
    localNotificationsPlugin = TestBed.inject(LOCAL_NOTIFICATIONS_PLUGIN);
    const translocoService = TestBed.inject(TranslocoService);
    const snackbar = TestBed.inject(MatSnackBar);
    const id = 2;
    item = new NotificationItem(
      id,
      localNotificationsPlugin,
      translocoService,
      snackbar
    );
  });

  it('should be created', () => expect(item).toBeTruthy());

  it('should be able to notify', async () => {
    spyOn(console, 'info');
    expect(await item.notify(SAMPLE_TITLE, SAMPLE_MESSAGE)).toBeInstanceOf(
      NotificationItem
    );
  });

  it('should be able to notify error', async () => {
    spyOn(console, 'error');
    expect(await item.error(SAMPLE_ERROR)).toBeInstanceOf(Error);
  });

  it('should be able to cancel itself', async () => {
    spyOn(console, 'log');
    expect(await item.cancel()).toBeInstanceOf(NotificationItem);
  });

  it('should be able to notify with on going action and cancel automatically', async () => {
    spyOn(console, 'info');
    spyOn(localNotificationsPlugin, 'cancel').and.resolveTo();
    const expected = 2;
    const result = await item.notifyOnGoing(
      of(1, expected),
      SAMPLE_TITLE,
      SAMPLE_MESSAGE
    );
    expect(localNotificationsPlugin.cancel).toHaveBeenCalled();
    expect(result).toEqual(expected);
  });

  it('should return an Error and do not cancel automatically when throw during on going action', async () => {
    const expected = SAMPLE_ERROR;
    spyOn(console, 'info');
    spyOn(localNotificationsPlugin, 'cancel').and.resolveTo();
    spyOn(item, 'error').and.resolveTo(expected);
    try {
      await item.notifyOnGoing(
        throwError(expected),
        SAMPLE_TITLE,
        SAMPLE_MESSAGE
      );
    } catch (err) {
      expect(err).toEqual(expected);
    }
    expect(localNotificationsPlugin.cancel).not.toHaveBeenCalled();
    expect(item.error).toHaveBeenCalled();
  });
});

const SAMPLE_TITLE = 'SAMPLE_TITLE';
const SAMPLE_MESSAGE = 'SAMPLE_MESSAGE';
const SAMPLE_ERROR = new Error('SAMPLE_ERROR');
