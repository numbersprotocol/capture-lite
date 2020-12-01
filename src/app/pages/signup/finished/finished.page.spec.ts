import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { SharedTestingModule } from '../../../shared/shared-testing.module';
import { FinishedPage } from './finished.page';

describe('FinishedPage', () => {
  let component: FinishedPage;
  let fixture: ComponentFixture<FinishedPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FinishedPage],
      imports: [
        SharedTestingModule,
        IonicModule.forRoot(),
        RouterTestingModule,
        HttpClientTestingModule,
        MatIconModule,
        MatButtonModule,
        MatToolbarModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FinishedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
