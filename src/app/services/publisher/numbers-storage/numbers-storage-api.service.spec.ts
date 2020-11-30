import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../../shared/shared-testing.module';
import { NumbersStorageApi } from './numbers-storage-api.service';

describe('NumbersStorageApi', () => {
  let service: NumbersStorageApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule, HttpClientTestingModule],
    });
    service = TestBed.inject(NumbersStorageApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
