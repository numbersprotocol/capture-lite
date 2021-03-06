import { TestBed } from '@angular/core/testing';
import { defer } from 'rxjs';
import { concatMapTo } from 'rxjs/operators';
import { Assets, isFacts } from '../../../repositories/proof/proof';
import { SharedTestingModule } from '../../../shared-testing.module';
import { CapacitorFactsProvider } from './capacitor-facts-provider.service';

describe('CapacitorFactsProvider', () => {
  let provider: CapacitorFactsProvider;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
    });
    provider = TestBed.inject(CapacitorFactsProvider);
  });

  it('should be created', () => expect(provider).toBeTruthy());

  it('should have ID', () => expect(provider.id).toBeTruthy());

  it('should provide facts', async () => {
    const assets: Assets = {};

    const facts = await provider.provide(assets);

    expect(isFacts(facts)).toBeTrue();
  });

  it('should get if collecting device info enabled by value', async () => {
    const expected = true;

    await provider.setDeviceInfoCollection(expected);

    expect(await provider.isDeviceInfoCollectionEnabled()).toEqual(expected);
  });

  it('should get if collecting device info enabled by Observable', done => {
    const expected = true;

    defer(() => provider.setDeviceInfoCollection(expected))
      .pipe(concatMapTo(provider.isDeviceInfoCollectionEnabled$))
      .subscribe(result => {
        expect(result).toEqual(expected);
        done();
      });
  });

  it('should get if collecting location info enabled by value', async () => {
    const expected = true;

    await provider.setGeolocationInfoCollection(expected);

    expect(await provider.isGeolocationInfoCollectionEnabled()).toEqual(
      expected
    );
  });

  it('should get if collecting location info enabled by Observable', done => {
    const expected = true;

    defer(() => provider.setGeolocationInfoCollection(expected))
      .pipe(concatMapTo(provider.isGeolocationInfoCollectionEnabled$))
      .subscribe(result => {
        expect(result).toEqual(expected);
        done();
      });
  });
});
