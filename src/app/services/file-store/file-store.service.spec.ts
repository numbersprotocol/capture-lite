import { TestBed } from '@angular/core/testing';
import { Plugins } from '@capacitor/core';
import { FILESYSTEM_PLUGIN } from '../../shared/capacitor-plugins/capacitor-plugins.module';
import { SharedTestingModule } from '../../shared/shared-testing.module';
import { stringToBase64 } from '../../utils/encoding/encoding';
import { FileStore } from './file-store.service';

const { Filesystem } = Plugins;

describe('FileStore', () => {
  let store: FileStore;
  const sampleFile =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  const sampleHash =
    '93ae7d494fad0fb30cbf3ae746a39c4bc7a0f8bbf87fbb587a3f3c01f3c5ce20';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
      providers: [{ provide: FILESYSTEM_PLUGIN, useValue: Filesystem }],
    });
    store = TestBed.inject(FileStore);
  });

  afterEach(async () => store.clear());

  it('should be created', () => expect(store).toBeTruthy());

  it('should check if file exists', async () => {
    expect(await store.exists(sampleHash)).toBeFalse();
  });

  it('should write file with Base64', async () => {
    const hash = await store.write(sampleFile);
    expect(await store.exists(hash)).toBeTrue();
  });

  it('should read file with hash', async () => {
    const hash = await store.write(sampleFile);
    expect(await store.read(hash)).toEqual(sampleFile);
  });

  it('should delete file with hash', async () => {
    const hash = await store.write(sampleFile);

    await store.delete(hash);

    expect(await store.exists(hash)).toBeFalse();
  });

  it('should remove all files after clear', async () => {
    const hash1 = await store.write(sampleFile);
    const anotherFile =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEX/TQBcNTh/AAAAAXRSTlPM0jRW/QAAAApJREFUeJxjYgAAAAYAAzY3fKgAAAAASUVORK5CYII=';
    const hash2 = await store.write(anotherFile);

    await store.clear();

    expect(await store.exists(hash1)).toBeFalse();
    expect(await store.exists(hash2)).toBeFalse();
  });

  it('should write atomicly', async () => {
    const fileCount = 100;
    const files = [...Array(fileCount).keys()].map(value =>
      stringToBase64(`${value}`)
    );

    const hashes = await Promise.all(files.map(file => store.write(file)));

    for (const hash of hashes) {
      expect(await store.exists(hash)).toBeTrue();
    }
  });

  it('should delete atomicly', async () => {
    const fileCount = 100;
    const files = [...Array(fileCount).keys()].map(value =>
      stringToBase64(`${value}`)
    );
    const hashes = [];

    for (const file of files) {
      hashes.push(await store.write(file));
    }

    await Promise.all(hashes.map(hash => store.delete(hash)));

    for (const hash of hashes) {
      expect(await store.exists(hash)).toBeFalse();
    }
  });
});
