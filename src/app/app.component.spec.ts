import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { Platform } from '@ionic/angular';
import { AppComponent } from './app.component';
import { CapacitorPluginsTestingModule } from './shared/core/capacitor-plugins/capacitor-plugins-testing.module';
import { MaterialTestingModule } from './shared/core/material/material-testing.module';
import { getTranslocoTestingModule } from './shared/core/transloco/transloco-testing.module';

describe('AppComponent', () => {
  let platformReadySpy: Promise<void>;
  let platformSpy: Platform;

  beforeEach(
    waitForAsync(() => {
      platformReadySpy = Promise.resolve();
      platformSpy = jasmine.createSpyObj('Platform', {
        ready: platformReadySpy,
      });

      TestBed.configureTestingModule({
        declarations: [AppComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        imports: [
          CapacitorPluginsTestingModule,
          HttpClientTestingModule,
          getTranslocoTestingModule(),
          MaterialTestingModule,
        ],
        providers: [{ provide: Platform, useValue: platformSpy }],
      }).compileComponents();
    })
  );

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
