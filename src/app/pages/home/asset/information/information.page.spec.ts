import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SharedTestingModule } from '../../../../shared/shared-testing.module';
import { InformationPage } from './information.page';

describe('InformationPage', () => {
  let component: InformationPage;
  let fixture: ComponentFixture<InformationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [InformationPage],
      imports: [
        SharedTestingModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatSnackBarModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InformationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
