import { HttpClient } from '@angular/common/http';
import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { SharedTestingModule } from '../../shared/shared-testing.module';
import { SignupPage } from './signup.page';

describe('SignupPage', () => {
  let component: SignupPage;
  let fixture: ComponentFixture<SignupPage>;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [SignupPage],
        imports: [
          SharedTestingModule,
          FormlyModule.forRoot(),
          FormlyMaterialModule,
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(SignupPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
      httpClient = TestBed.inject(HttpClient);
      httpTestingController = TestBed.inject(HttpTestingController);
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
