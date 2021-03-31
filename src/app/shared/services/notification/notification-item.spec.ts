import { TestBed } from '@angular/core/testing';
import { LocalNotificationsPlugin, Plugins } from '@capacitor/core';
import { TranslocoService } from '@ngneat/transloco';
import { LOCAL_NOTIFICATIONS_PLUGIN } from '../../../shared/core/capacitor-plugins/capacitor-plugins.module';
import { SharedTestingModule } from '../../../shared/shared-testing.module';
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
    const id = 2;
    item = new NotificationItem(id, localNotificationsPlugin, translocoService);
  });

  it('should be created', () => expect(item).toBeTruthy());

  it('should be able to notify', async () => {
    spyOn(console, 'log');
    expect(await item.notify(SAMPLE_TITLE, SAMPLE_MESSAGE)).toBeInstanceOf(
      NotificationItem
    );
  });
});

const SAMPLE_TITLE = 'SAMPLE_TITLE';
const SAMPLE_MESSAGE = 'SAMPLE_MESSAGE';
