import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SharedTestingModule } from '../../shared/shared-testing.module';
import { ContactsPage } from './contacts.page';

describe('ContactsPage', () => {
  let component: ContactsPage;
  let fixture: ComponentFixture<ContactsPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ContactsPage],
        imports: [SharedTestingModule],
      }).compileComponents();

      fixture = TestBed.createComponent(ContactsPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
