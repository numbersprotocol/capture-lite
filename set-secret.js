const fs = require('fs');

// Configure Angular `secret.ts` file path
const targetPath = './src/environments/secret.ts';

// `secret.ts` file structure
const envConfigFile = `export const secret = {
  numbersStorageBaseUrl: '${process.env.NUMBERS_STORAGE_BASE_URL}'
};
`;
fs.writeFile(targetPath, envConfigFile, err => {
  if (err) {
    throw console.error(err);
  } else {
    console.log(
      `Angular secrets.ts file generated correctly at ${targetPath} \n`
    );
  }
});
