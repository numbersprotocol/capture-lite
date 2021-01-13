// tslint:disable: no-unbound-method

import { TestBed } from '@angular/core/testing';
import { LocalNotificationsPlugin, Plugins } from '@capacitor/core';
import { LOCAL_NOTIFICATIONS_PLUGIN } from '../../../shared/core/capacitor-plugins/capacitor-plugins.module';
import { SharedTestingModule } from '../../../shared/shared-testing.module';
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
});

const SAMPLE_TITLE = 'SAMPLE_TITLE';
const SAMPLE_MESSAGE = 'SAMPLE_MESSAGE';
const SAMPLE_ERROR = new Error('SAMPLE_ERROR');
