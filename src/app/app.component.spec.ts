import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { InAppPurchase2 } from '@awesome-cordova-plugins/in-app-purchase-2/ngx';
import { Platform } from '@ionic/angular';
import { AppComponent } from './app.component';
import { CapacitorPluginsTestingModule } from './shared/capacitor-plugins/capacitor-plugins-testing.module';
import { getTranslocoTestingModule } from './shared/language/transloco/transloco-testing.module';
import { MaterialTestingModule } from './shared/material/material-testing.module';

describe('AppComponent', () => {
  let platformReadySpy: Promise<void>;
  let platformIsSpy: boolean | undefined;
  let platformSpy: Platform;

  beforeEach(
    waitForAsync(() => {
      platformReadySpy = Promise.resolve();
      platformIsSpy = false;
      platformSpy = jasmine.createSpyObj('Platform', {
        ready: platformReadySpy,
        is: platformIsSpy,
      });

      const iap2SpyMethods = ['error', 'ready', 'when', 'refresh', 'off'];
      const inAppPurchase2Spy = jasmine.createSpyObj(
        'InAppPurchase2',
        iap2SpyMethods
      );

      TestBed.configureTestingModule({
        declarations: [AppComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        imports: [
          CapacitorPluginsTestingModule,
          HttpClientTestingModule,
          getTranslocoTestingModule(),
          MaterialTestingModule,
        ],
        providers: [
          { provide: Platform, useValue: platformSpy },
          { provide: InAppPurchase2, useValue: inAppPurchase2Spy },
        ],
      }).compileComponents();
    })
  );

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
