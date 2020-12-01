import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SharedTestingModule } from '../../../../shared/shared-testing.module';
import { SendingPostCapturePage } from './sending-post-capture.page';

describe('SendingPostCapturePage', () => {
  let component: SendingPostCapturePage;
  let fixture: ComponentFixture<SendingPostCapturePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SendingPostCapturePage],
      imports: [
        SharedTestingModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatCardModule,
        MatInputModule,
        MatFormFieldModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SendingPostCapturePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
