import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { IonicModule } from '@ionic/angular';
import { Proof } from 'src/app/services/data/proof/proof';
import { getTranslocoModule } from 'src/app/transloco/transloco-root.module.spec';
import { PostCaptureCardComponent } from './post-capture-card.component';

describe('PostCaptureCardComponent', () => {
  let component: PostCaptureCardComponent;
  let fixture: ComponentFixture<PostCaptureCardComponent>;
  const expectedProof: Proof = { hash: '1234567890abcdef', timestamp: 1604473851208, mimeType: 'image/jpeg' };
  const expectedImageSrc = 'https://picsum.photos/200/300';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PostCaptureCardComponent],
      imports: [
        IonicModule.forRoot(),
        HttpClientTestingModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        getTranslocoModule()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PostCaptureCardComponent);
    component = fixture.componentInstance;
    component.proof = expectedProof;
    component.imageSrc = expectedImageSrc;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
