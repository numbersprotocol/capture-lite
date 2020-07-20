import { fileNameWithoutExtension } from './file';

describe('file', () => {
  it('test fileNameWithoutExtension', () => {
    const fileName = 'file/path/hello.txt';
    const expected = 'hello';
    expect(fileNameWithoutExtension(fileName)).toEqual(expected);
  });
});
