import { TestBed } from '@angular/core/testing';
import { Plugins } from '@capacitor/core';
import { TranslocoService } from '@ngneat/transloco';
import { LOCAL_NOTIFICATIONS_PLUGIN } from '../../shared/capacitor-plugins/capacitor-plugins.module';
import { SharedTestingModule } from '../../shared/shared-testing.module';
import { NotificationItem } from './notification-item';

const { LocalNotifications } = Plugins;

describe('NotificationItem', () => {
  let item: NotificationItem;
  const id = 2;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
      providers: [
        { provide: LOCAL_NOTIFICATIONS_PLUGIN, useValue: LocalNotifications },
      ],
    });
    const localNotificationsPlugin = TestBed.inject(LOCAL_NOTIFICATIONS_PLUGIN);
    const translocoService = TestBed.inject(TranslocoService);
    item = new NotificationItem(id, localNotificationsPlugin, translocoService);
  });

  it('should be created', () => expect(item).toBeTruthy());

  it('should be able to notify', async () => {
    spyOn(console, 'log');
    expect(await item.notify('', '')).toBeInstanceOf(NotificationItem);
  });

  it('should be able to notify error', async () => {
    spyOn(console, 'error');
    expect(await item.error(new Error())).toBeInstanceOf(NotificationItem);
  });

  it('should be able to cancel itself', async () => {
    expect(await item.cancel()).toBeInstanceOf(NotificationItem);
  });
});
