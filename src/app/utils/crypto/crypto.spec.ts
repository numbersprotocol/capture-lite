import { sha256$, sha256WithBase64$, sha256WithString$ } from './crypto';

describe('crypto', () => {

  it('test sha256$', (done: DoneFn) => {
    const value = { hello: 'world', wtf: 1 };
    const expected = '70feb2aa21f96b8777193a410617790814c06bc8e33099e0ddc2c562b55e8a5a';
    sha256$(value).subscribe(hash => {
      expect(hash).toEqual(expected);
      done();
    });
  });

  it('test sha256WithString$', (done: DoneFn) => {
    const value = '{"hello":"world","wtf":1}';
    const expected = '70feb2aa21f96b8777193a410617790814c06bc8e33099e0ddc2c562b55e8a5a';
    sha256WithString$(value).subscribe(hash => {
      expect(hash).toEqual(expected);
      done();
    });
  });

  it('test sha256WithBase64$', (done: DoneFn) => {
    const value = 'd3RmCg==';
    const expected = 'e57ee9f15034c399f4e0db906e79f195acbdcc9f30a8846732ea2b271de91e13';
    sha256WithBase64$(value).subscribe(hash => {
      expect(hash).toEqual(expected);
      done();
    });
  });
});
