import { Information } from 'src/app/services/data/information/information';
import { Proof } from 'src/app/services/data/proof/proof';
import { JPEG } from '../mime-type';
import { createSortedProofInformation } from './serialization';

describe('serialization', () => {

  const hash = '1837bc2c546d46c705204cf9f857b90b1dbffd2a7988451670119945ba39a10b';
  const provider1 = 'test-provider-1';
  const provider2 = 'test-provider-2';

  it('SortedProofInformation should have sameOrder with same data', () => {

    const proof: Proof = {
      hash,
      mimeType: JPEG,
      timestamp: 0
    };
    const information1: Information = {
      proofHash: hash,
      provider: provider1,
      name: 'longitude',
      value: '23.05'
    };
    const information2: Information = {
      proofHash: hash,
      provider: provider1,
      name: 'happiness',
      value: '52'
    };
    const information3: Information = {
      proofHash: hash,
      provider: provider2,
      name: 'happiness',
      value: '52'
    };
    const sortedProofInformation1 = createSortedProofInformation(proof, [information1, information3, information2]);
    const sortedProofInformation2 = createSortedProofInformation(proof, [information3, information2, information1]);

    expect(JSON.stringify(sortedProofInformation1)).toEqual(JSON.stringify(sortedProofInformation2));
  });
});
