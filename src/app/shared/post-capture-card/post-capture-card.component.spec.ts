import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DiaBackendAsset } from '../../services/dia-backend/asset/dia-backend-asset-repository.service';
import { DiaBackendTransaction } from '../../services/dia-backend/transaction/dia-backend-transaction-repository.service';
import { SharedTestingModule } from '../shared-testing.module';
import { PostCaptureCardComponent } from './post-capture-card.component';

describe('PostCaptureCardComponent', () => {
  let component: PostCaptureCardComponent;
  let fixture: ComponentFixture<PostCaptureCardComponent>;
  const expectedAsset: DiaBackendAsset = {
    id: 'abcd-efgh-ijkl',
    proof_hash: 'abcdef1234567890',
    owner: 'me',
    asset_file: 'https://picsum.photos/200/300',
    information: {
      proof: { hash: '', timestamp: 0, mimeType: 'image/jpeg' },
      information: [],
    },
    signature: [],
    caption: '',
    uploaded_at: '',
    is_original_owner: true,
  };
  const expectedTranasction: DiaBackendTransaction = {
    id: '',
    sender: '',
    receiver_email: '',
    asset: {
      asset_file_thumbnail: 'https://picsum.photos/200/300',
      caption: '',
      id: 'abcd-efgh-ijkl',
    },
    receiver_email: '',
    created_at: '',
    expired: false,
    fulfilled_at: '',
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PostCaptureCardComponent],
      imports: [SharedTestingModule],
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
