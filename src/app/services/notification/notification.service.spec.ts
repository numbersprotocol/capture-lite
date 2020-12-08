// tslint:disable: no-unbound-method

import { TestBed } from '@angular/core/testing';
import { LocalNotificationsPlugin, Plugins } from '@capacitor/core';
import { of, throwError } from 'rxjs';
import { LOCAL_NOTIFICATIONS_PLUGIN } from '../../shared/capacitor-plugins/capacitor-plugins.module';
import { SharedTestingModule } from '../../shared/shared-testing.module';
import { NotificationItem } from './notification-item';
import { NotificationService } from './notification.service';

const { LocalNotifications } = Plugins;

describe('NotificationService', () => {
  let service: NotificationService;
  let localNotificationsPlugin: LocalNotificationsPlugin;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
      providers: [
        { provide: LOCAL_NOTIFICATIONS_PLUGIN, useValue: LocalNotifications },
      ],
    });
    service = TestBed.inject(NotificationService);
    localNotificationsPlugin = TestBed.inject(LOCAL_NOTIFICATIONS_PLUGIN);
  });

  it('should be created', () => expect(service).toBeTruthy());

  it('should create notification', () =>
    expect(service.createNotification()).toBeInstanceOf(NotificationItem));

  it('should be able to notify', async () => {
    spyOn(console, 'info');
    expect(await service.notify(SAMPLE_TITLE, SAMPLE_MESSAGE)).toBeInstanceOf(
      NotificationItem
    );
  });

  it('should be able to notify error', async () => {
    spyOn(console, 'error');
    expect(await service.error(SAMPLE_ERROR)).toBeInstanceOf(Error);
  });

  it('should be able to notify with on going action and cancel automatically', async () => {
    spyOn(console, 'info');
    spyOn(localNotificationsPlugin, 'cancel').and.resolveTo();
    const expected = 2;
    const result = await service.notifyOnGoing(
      of(1, expected),
      SAMPLE_TITLE,
      SAMPLE_MESSAGE
    );
    expect(localNotificationsPlugin.cancel).toHaveBeenCalled();
    expect(result).toEqual(expected);
  });

  it('should return an Error and do not cancel automatically when throw during on going action', async () => {
    spyOn(console, 'info');
    spyOn(console, 'error');
    const expected = SAMPLE_ERROR;
    spyOn(localNotificationsPlugin, 'cancel').and.resolveTo();
    try {
      await service.notifyOnGoing(
        throwError(expected),
        SAMPLE_TITLE,
        SAMPLE_MESSAGE
      );
    } catch (err) {
      expect(err).toEqual(expected);
    }
    expect(localNotificationsPlugin.cancel).not.toHaveBeenCalled();
  });
});

const SAMPLE_TITLE = 'SAMPLE_TITLE';
const SAMPLE_MESSAGE = 'SAMPLE_MESSAGE';
const SAMPLE_ERROR = new Error('SAMPLE_ERROR');
