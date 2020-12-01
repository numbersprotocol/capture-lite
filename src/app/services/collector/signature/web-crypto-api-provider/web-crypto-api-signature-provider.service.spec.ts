import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../../../shared/shared-testing.module';
import { WebCryptoApiSignatureProvider } from './web-crypto-api-signature-provider.service';

describe('WebCryptoApiSignatureProvider', () => {
  let service: WebCryptoApiSignatureProvider;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
    });
    service = TestBed.inject(WebCryptoApiSignatureProvider);
  });

  it('should be created', () => expect(service).toBeTruthy());
});
