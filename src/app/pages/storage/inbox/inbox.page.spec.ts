import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { IonicModule } from '@ionic/angular';
import { getTranslocoModule } from 'src/app/transloco/transloco-root.module.spec';
import { InboxPage } from './inbox.page';

describe('InboxPage', () => {
  let component: InboxPage;
  let fixture: ComponentFixture<InboxPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [InboxPage],
      imports: [
        IonicModule.forRoot(),
        getTranslocoModule(),
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatListModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InboxPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
