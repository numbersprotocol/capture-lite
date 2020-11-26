import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatListModule } from '@angular/material/list';
import { IonicModule } from '@ionic/angular';
import { Transaction } from 'src/app/services/publisher/numbers-storage/numbers-storage-api.service';
import { Asset } from 'src/app/services/publisher/numbers-storage/repositories/asset/asset';
import { getTranslocoModule } from 'src/app/transloco/transloco-root.module.spec';
import { PostCaptureCardComponent } from './post-capture-card.component';

describe('PostCaptureCardComponent', () => {
  let component: PostCaptureCardComponent;
  let fixture: ComponentFixture<PostCaptureCardComponent>;
  const expectedAsset: Asset = {
    id: 'abcd-efgh-ijkl',
    proof_hash: 'abcdef1234567890',
    owner: 'me',
    asset_file: 'https://picsum.photos/200/300',
    information: { proof: { hash: '', timestamp: 0, mimeType: 'image/jpeg' }, information: [] },
    signature: [],
    caption: '',
    uploaded_at: '',
    is_original_owner: true
  };
  const expectedTranasction: Transaction = {
    id: '',
    sender: '',
    asset: {
      asset_file_thumbnail: 'https://picsum.photos/200/300',
      caption: '',
      id: 'abcd-efgh-ijkl'
    },
    created_at: '',
    expired: false,
    fulfilled_at: ''
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PostCaptureCardComponent],
      imports: [
        IonicModule.forRoot(),
        HttpClientTestingModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatIconTestingModule,
        MatListModule,
        getTranslocoModule()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PostCaptureCardComponent);
    component = fixture.componentInstance;
    component.asset = expectedAsset;
    component.transaction = expectedTranasction;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
