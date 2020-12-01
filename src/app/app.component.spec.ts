import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { Platform } from '@ionic/angular';
import { AppComponent } from './app.component';
import { getTranslocoModule } from './services/transloco/transloco-root-testing.module';
import { SharedTestingModule } from './shared/shared-testing.module';

describe('AppComponent', () => {
  let platformReadySpy: Promise<void>;
  let platformSpy: Platform;

  beforeEach(async(() => {
    platformReadySpy = Promise.resolve();
    platformSpy = jasmine.createSpyObj('Platform', { ready: platformReadySpy });

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        SharedTestingModule,
        getTranslocoModule(),
        HttpClientTestingModule,
      ],
      providers: [{ provide: Platform, useValue: platformSpy }],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should initialize the app', async () => {
    TestBed.createComponent(AppComponent);
    // tslint:disable-next-line: no-unbound-method
    expect(platformSpy.ready).toHaveBeenCalled();
    await platformReadySpy;
  });
});
