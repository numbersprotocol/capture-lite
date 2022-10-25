const fs = require('fs');

// Configure Angular `secret.ts` file path
const targetPath = './.npmrc';

// `.npmrc` file structure
const envConfigFile = `
@pqina:registry=https://npm.pqina.nl/
//npm.pqina.nl/:_authToken=${process.env.NUMBERS_PQINA_NPM_KEY}
`;
fs.writeFile(targetPath, envConfigFile, err => {
  if (err) {
    throw console.error(err);
  }
  console.log(`A npmrc file has generated successfully at ${targetPath} \n`);
});
