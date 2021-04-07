import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SharedTestingModule } from '../../shared-testing.module';
import { AvatarComponent } from './avatar.component';

describe('AvatarComponent', () => {
  let component: AvatarComponent;
  let fixture: ComponentFixture<AvatarComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [AvatarComponent],
        imports: [SharedTestingModule],
      }).compileComponents();

      fixture = TestBed.createComponent(AvatarComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
