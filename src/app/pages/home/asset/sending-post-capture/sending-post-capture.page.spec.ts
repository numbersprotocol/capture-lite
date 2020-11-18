import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { SharedTestingModule } from 'src/app/shared/shared-testing.module';
import { getTranslocoModule } from 'src/app/transloco/transloco-root.module.spec';
import { SendingPostCapturePage } from './sending-post-capture.page';

describe('SendingPostCapturePage', () => {
  let component: SendingPostCapturePage;
  let fixture: ComponentFixture<SendingPostCapturePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SendingPostCapturePage],
      imports: [
        SharedTestingModule,
        IonicModule.forRoot(),
        getTranslocoModule(),
        RouterTestingModule,
        FormsModule,
        HttpClientTestingModule,
        BrowserAnimationsModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatCardModule,
        MatInputModule,
        MatFormFieldModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SendingPostCapturePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
