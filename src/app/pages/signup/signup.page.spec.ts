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

import { SignupPage } from './signup.page';

describe('SignupPage', () => {
  let component: SignupPage;
  let fixture: ComponentFixture<SignupPage>;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SignupPage],
      imports: [
        IonicModule.forRoot(),
        HttpClientTestingModule,
        getTranslocoModule(),
        RouterTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
