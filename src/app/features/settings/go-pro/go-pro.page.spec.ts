import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SharedTestingModule } from '../../../shared/shared-testing.module';
import { GoProPage } from './go-pro.page';

describe('GoProPage', () => {
  let component: GoProPage;
  let fixture: ComponentFixture<GoProPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [GoProPage],
        imports: [SharedTestingModule],
      }).compileComponents();

      fixture = TestBed.createComponent(GoProPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
