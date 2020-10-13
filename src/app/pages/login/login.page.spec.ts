import { HttpClient } from '@angular/common/http';
import {
  HttpClientTestingModule, HttpTestingController,
} from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import {
  getTranslocoModule,
} from 'src/app/transloco/transloco-root.module.spec';

import { IonicModule } from '@ionic/angular';

import { LoginPage } from './login.page';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoginPage],
      imports: [
        IonicModule.forRoot(),
        HttpClientTestingModule,
        getTranslocoModule(),
        RouterTestingModule,
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
