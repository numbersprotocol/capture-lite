import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { SharedTestingModule } from 'src/app/shared/shared-testing.module';
import { getTranslocoModule } from 'src/app/transloco/transloco-root.module.spec';
import { ActivityPage } from './activity.page';

describe('ActivityPage', () => {
  let component: ActivityPage;
  let fixture: ComponentFixture<ActivityPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ActivityPage],
      imports: [
        SharedTestingModule,
        IonicModule.forRoot(),
        getTranslocoModule(),
        RouterTestingModule,
        HttpClientTestingModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatToolbarModule,
        MatDividerModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
