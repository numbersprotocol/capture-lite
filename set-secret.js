const fs = require('fs');

// Configure Angular `secret.ts` file path
const targetPath = './src/app/services/dia-backend/secret.ts';

// `secret.ts` file structure
const envConfigFile = `export const BASE_URL = '${process.env.NUMBERS_STORAGE_BASE_URL}';
`;
fs.writeFile(targetPath, envConfigFile, err => {
  if (err) {
    throw console.error(err);
  } else {
    console.log(`A secret file has generated successfully at ${targetPath} \n`);
  }
});
