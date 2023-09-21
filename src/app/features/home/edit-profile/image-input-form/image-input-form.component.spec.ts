import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MatIconRegistry } from '@angular/material/icon';
import { FakeMatIconRegistry } from '@angular/material/icon/testing';
import { SharedTestingModule } from '../../../../shared/shared-testing.module';
import { ImageInputFormComponent } from './image-input-form.component';

describe('ImageInputFormComponent', () => {
  let component: ImageInputFormComponent;
  let fixture: ComponentFixture<ImageInputFormComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ImageInputFormComponent],
        imports: [SharedTestingModule],
        providers: [
          { provide: MatIconRegistry, useClass: FakeMatIconRegistry },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(ImageInputFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
