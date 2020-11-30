import { sortObjectDeeplyByKey } from './immutable';

describe('sortObjectDeeplyByKey', () => {
  it('should return the same JSON serialized string with different ordered objects', () => {
    const obj1 = {
      a: {
        a: {
          a: { b: 'hello' },
          b: 'hello',
        },
        b: 'hello',
      },
      b: 'hello',
    };
    const obj2 = {
      b: 'hello',
      a: {
        b: 'hello',
        a: {
          b: 'hello',
          a: { b: 'hello' },
        },
      },
    };

    expect(JSON.stringify(sortObjectDeeplyByKey(obj1))).toEqual(
      JSON.stringify(sortObjectDeeplyByKey(obj2))
    );
  });
});
