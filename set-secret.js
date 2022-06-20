const fs = require('fs');

// Configure Angular `secret.ts` file path
const targetPath = './src/app/shared/dia-backend/secret.ts';

// `secret.ts` file structure
const envConfigFile = `
export const BASE_URL = '${process.env.NUMBERS_STORAGE_BASE_URL}';
export const TRUSTED_CLIENT_KEY = '${process.env.NUMBERS_STORAGE_TRUSTED_CLIENT_KEY}';
export const BUBBLE_DB_URL = '${process.env.NUMBERS_BUBBLE_DB_URL}';
export const BUBBLE_API_URL = '${process.env.BUBBLE_API_URL}';
`;
fs.writeFile(targetPath, envConfigFile, err => {
  if (err) {
    throw console.error(err);
  }
  console.log(`A secret file has generated successfully at ${targetPath} \n`);
});
