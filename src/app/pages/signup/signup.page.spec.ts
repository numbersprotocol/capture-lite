import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { getTranslocoModule } from 'src/app/transloco/transloco-root.module.spec';
import { fieldMatchValidator } from './signup.module';
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
        RouterTestingModule,
        getTranslocoModule(),
        HttpClientTestingModule,
        FormlyModule.forRoot({ validators: [{ name: 'fieldMatch', validation: fieldMatchValidator }] }),
        FormlyMaterialModule,
        ReactiveFormsModule,
        BrowserAnimationsModule
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
