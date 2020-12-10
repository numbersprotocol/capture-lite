// tslint:disable: no-null-keyword
import { of } from 'rxjs';
import { toArray } from 'rxjs/operators';
import { isNonNullable, switchTap, switchTapTo } from './rx-operators';

describe('rx-operators', () => {
  it('should filter null and undefined values with type guard', done => {
    const expected = [0, 1, 2];
    of(expected[0], expected[1], null, undefined, expected[2])
      .pipe(isNonNullable(), toArray())
      .subscribe(result => {
        expect(result).toEqual(expected);
        done();
      });
  });

  it('should switchTap behaving the same with switchMapTo but ignore the result', done => {
    const expected = 1;
    of(expected)
      .pipe(switchTap(v => of(v + v)))
      .subscribe(result => {
        expect(result).toEqual(expected);
        done();
      });
  });

  it('should switchTapTo behaving the same with switchMapTo but ignore the result', done => {
    const expected = 1;
    of(expected)
      .pipe(switchTapTo(of(2)))
      .subscribe(result => {
        expect(result).toEqual(expected);
        done();
      });
  });
});
