import { TestBed } from '@angular/core/testing';
import { Plugins } from '@capacitor/core';
import { FILESYSTEM_PLUGIN } from '../../shared/capacitor-plugins/capacitor-plugins.module';
import { SharedTestingModule } from '../../shared/shared-testing.module';
import { stringToBase64 } from '../../utils/encoding/encoding';
import { MimeType } from '../../utils/mime-type';
import { ImageStore } from './image-store.service';

const { Filesystem } = Plugins;

describe('ImageStore', () => {
  let store: ImageStore;
  const sampleFile =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  const sampleIndex =
    '93ae7d494fad0fb30cbf3ae746a39c4bc7a0f8bbf87fbb587a3f3c01f3c5ce20';
  const sampleMimeType: MimeType = 'image/png';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
      providers: [{ provide: FILESYSTEM_PLUGIN, useValue: Filesystem }],
    });
    store = TestBed.inject(ImageStore);
  });

  afterEach(async () => store.drop());

  it('should be created', () => expect(store).toBeTruthy());

  it('should check if file exists', async () => {
    expect(await store.exists(sampleIndex)).toBeFalse();
  });

  it('should write file with Base64', async () => {
    const index = await store.write(sampleFile);
    expect(await store.exists(index)).toBeTrue();
  });

  it('should read file with index', async () => {
    const index = await store.write(sampleFile);
    expect(await store.read(index)).toEqual(sampleFile);
  });

  it('should delete file with index', async () => {
    const index = await store.write(sampleFile);

    await store.delete(index);

    expect(await store.exists(index)).toBeFalse();
  });

  it('should delete file with index and thumbnail', async () => {
    const index = await store.write(sampleFile);
    await store.readThumbnail(index, sampleMimeType);

    await store.delete(index);

    expect(await store.exists(index)).toBeFalse();
  });

  it('should remove all files after drop', async () => {
    const index1 = await store.write(sampleFile);
    const anotherFile =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEX/TQBcNTh/AAAAAXRSTlPM0jRW/QAAAApJREFUeJxjYgAAAAYAAzY3fKgAAAAASUVORK5CYII=';
    const index2 = await store.write(anotherFile);

    await store.drop();

    expect(await store.exists(index1)).toBeFalse();
    expect(await store.exists(index2)).toBeFalse();
  });

  it('should write atomicly', async () => {
    const fileCount = 100;
    const files = [...Array(fileCount).keys()].map(value =>
      stringToBase64(`${value}`)
    );

    const indexes = await Promise.all(files.map(file => store.write(file)));

    for (const index of indexes) {
      expect(await store.exists(index)).toBeTrue();
    }
  });

  it('should delete atomicly', async () => {
    const fileCount = 100;
    const files = [...Array(fileCount).keys()].map(value =>
      stringToBase64(`${value}`)
    );
    const indexes = [];

    for (const file of files) {
      indexes.push(await store.write(file));
    }

    await Promise.all(indexes.map(index => store.delete(index)));

    for (const index of indexes) {
      expect(await store.exists(index)).toBeFalse();
    }
  });

  it('should read thumbnail', async () => {
    const index = await store.write(sampleFile);
    const thumbnailFile = await store.readThumbnail(index, sampleMimeType);
    expect(thumbnailFile).toBeTruthy();
  });
});
