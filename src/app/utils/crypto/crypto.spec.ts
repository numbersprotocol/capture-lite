import { sha256$ } from './crypto';

describe('crypto', () => {
  it('test sha256$', (done: DoneFn) => {
    sha256$('d3RmCg==').subscribe(
      hash => {
        expect(hash).toEqual('e57ee9f15034c399f4e0db906e79f195acbdcc9f30a8846732ea2b271de91e13');
        done();
      }
    );
  });
});
