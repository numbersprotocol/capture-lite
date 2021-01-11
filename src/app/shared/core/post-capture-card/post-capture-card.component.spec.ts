import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DiaBackendTransaction } from '../../../shared/services/dia-backend/transaction/dia-backend-transaction-repository.service';
import { SharedTestingModule } from '../../shared-testing.module';
import { PostCaptureCardComponent } from './post-capture-card.component';

describe('PostCaptureCardComponent', () => {
  let component: PostCaptureCardComponent;
  let fixture: ComponentFixture<PostCaptureCardComponent>;
  const expectedTranasction: DiaBackendTransaction = {
    id: '',
    sender: '',
    receiver_email: '',
    asset: {
      asset_file_thumbnail: 'https://picsum.photos/200/300',
      caption: '',
      id: 'abcd-efgh-ijkl',
    },
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
    // @ts-ignore
    component.transaction = expectedTranasction;
    fixture.detectChanges();
  }));

  // See issue: https://github.com/numbersprotocol/capture-lite/issues/277
  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
