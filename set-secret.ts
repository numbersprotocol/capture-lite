// tslint:disable: no-console

import * as fs from 'fs';

// Configure Angular `secret.ts` file path
const targetPath = './src/app/shared/services/dia-backend/secret.ts';

// `secret.ts` file structure
const envConfigFile = `export const BASE_URL = '${process.env.NUMBERS_STORAGE_BASE_URL}';
`;
fs.writeFile(targetPath, envConfigFile, (err: any) => {
  if (err) {
    throw console.error(err);
  }
  console.log(`A secret file has generated successfully at ${targetPath} \n`);
});
