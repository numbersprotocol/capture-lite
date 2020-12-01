import {
  createEcKeyPair,
  sha256WithBase64,
  sha256WithString,
  signWithSha256AndEcdsa,
  verifyWithSha256AndEcdsa,
} from './crypto';

describe('crypto', () => {
  it('should hash string with SHA256', async () => {
    const value = '{"hello":"world","wtf":1}';
    const expected =
      '70feb2aa21f96b8777193a410617790814c06bc8e33099e0ddc2c562b55e8a5a';
    const hash = await sha256WithString(value);
    expect(hash).toEqual(expected);
  });

  it('should hash base64 string with SHA256', async () => {
    const value = 'd3RmCg==';
    const expected =
      'e57ee9f15034c399f4e0db906e79f195acbdcc9f30a8846732ea2b271de91e13';
    const hash = await sha256WithBase64(value);
    expect(hash).toEqual(expected);
  });

  it('should sign and verify with valid signature from SHA256 and ECDSA', async () => {
    const message = 'hello';
    const keyPair = await createEcKeyPair();
    const signature = await signWithSha256AndEcdsa(message, keyPair.privateKey);
    const result = await verifyWithSha256AndEcdsa(
      message,
      signature,
      keyPair.publicKey
    );
    expect(result).toBeTrue();
  });

  it('should sign and verify with invalid signature from SHA256 and ECDSA', async () => {
    const message = 'hello';
    const keyPair = await createEcKeyPair();
    const signature = await signWithSha256AndEcdsa(message, keyPair.privateKey);
    const anotherKeyPair = await createEcKeyPair();
    const result = await verifyWithSha256AndEcdsa(
      message,
      signature,
      anotherKeyPair.publicKey
    );
    expect(result).toBeFalse();
  });
});
