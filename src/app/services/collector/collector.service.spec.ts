import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from 'src/app/shared/shared-testing.module';
import { getTranslocoModule } from 'src/app/transloco/transloco-root.module.spec';
import { MimeType } from 'src/app/utils/mime-type';
import { AssetMeta, Assets, DefaultFactId, Facts } from '../repositories/proof/proof';
import { CollectorService } from './collector.service';
import { InformationProvider } from './information/information-provider';

describe('CollectorService', () => {
  let service: CollectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedTestingModule,
        getTranslocoModule()
      ]
    });
    service = TestBed.inject(CollectorService);
  });

  it('should be created', () => expect(service).toBeTruthy());

  it('should get the stored proof after run', async () => {
    const proof = await service.runAndStore(ASSETS);
    expect(proof.assets).toEqual(ASSETS);
  });

  it('should remove added information providers', async () => {
    service.addInformationProvider(fakeInformationProvider);
    service.removeInformationProvider(fakeInformationProvider);

    const proof = await service.runAndStore(ASSETS);

    expect(proof.truth.providers).toEqual({});
  });

  it('should get the stored proof with provided information', async () => {
    service.addInformationProvider(fakeInformationProvider);
    const proof = await service.runAndStore(ASSETS);
    expect(proof.truth.providers).toEqual({ [fakeInformationProvider.id]: FACTS });
  });
});

const ASSET1_MIMETYPE: MimeType = 'image/png';
const ASSET1_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAYAAAADCAYAAACwAX77AAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2hvdO8Dvz4AAABAaVRYdENyZWF0aW9uIFRpbWUAAAAAADIwMjDlubTljYHkuIDmnIgxMOaXpSAo6YCx5LqMKSAyMOaZgjU55YiGMzfnp5JnJvHNAAAAFUlEQVQImWM0MTH5z4AFMGETxCsBAHRhAaHOZzVQAAAAAElFTkSuQmCC';
const ASSET1: AssetMeta = { mimeType: ASSET1_MIMETYPE };
const ASSET2_MIMETYPE: MimeType = 'image/png';
const ASSET2_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAABHNCSVQICAgIfAhkiAAAABZJREFUCJlj/Pnz538GJMDEgAYICwAAAbkD8p660MIAAAAASUVORK5CYII=';
const ASSET2: AssetMeta = { mimeType: ASSET2_MIMETYPE };
const ASSETS: Assets = {
  [ASSET1_BASE64]: ASSET1,
  [ASSET2_BASE64]: ASSET2
};

const GEOLOCATION_LATITUDE = 22.917923;
const GEOLOCATION_LONGITUDE = 120.859958;
const DEVICE_NAME_VALUE = 'Sony Xperia 1';
const FACTS: Facts = {
  [DefaultFactId.GEOLOCATION_LATITUDE]: GEOLOCATION_LATITUDE,
  [DefaultFactId.GEOLOCATION_LONGITUDE]: GEOLOCATION_LONGITUDE,
  [DefaultFactId.DEVICE_NAME]: DEVICE_NAME_VALUE
};

class FakeInformationProvider implements InformationProvider {
  readonly id = name;
  async provide(_: Assets) { return FACTS; }
}

const fakeInformationProvider = new FakeInformationProvider();
