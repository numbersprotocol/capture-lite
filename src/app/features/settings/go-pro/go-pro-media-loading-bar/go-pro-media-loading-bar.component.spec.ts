import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GoProMediaLoadingBarComponent } from './go-pro-media-loading-bar.component';

describe('GoProMediaLoadingBarComponent', () => {
  let component: GoProMediaLoadingBarComponent;
  let fixture: ComponentFixture<GoProMediaLoadingBarComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [GoProMediaLoadingBarComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(GoProMediaLoadingBarComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
