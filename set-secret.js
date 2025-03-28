const fs = require('fs');

// Configure Angular `secret.ts` file path
const targetPath = './src/app/shared/dia-backend/secret.ts';

// `secret.ts` file structure
const envConfigFile = `
export const BASE_URL = '${process.env.NUMBERS_STORAGE_BASE_URL}';
export const TRUSTED_CLIENT_KEY = '${process.env.NUMBERS_STORAGE_TRUSTED_CLIENT_KEY}';
export const BUBBLE_DB_URL = '${process.env.NUMBERS_BUBBLE_DB_URL}';
export const BUBBLE_IFRAME_URL = '${process.env.NUMBERS_BUBBLE_IFRAME_URL}';
export const BUBBLE_API_URL = '${process.env.BUBBLE_API_URL}';
export const APPS_FLYER_DEV_KEY = '${process.env.APPS_FLYER_DEV_KEY}'
export const GOOGLE_IOS_CLIENT_ID = '${process.env.GOOGLE_IOS_CLIENT_ID}'
export const GOOGLE_WEB_CLIENT_ID = '${process.env.GOOGLE_WEB_CLIENT_ID}'
export const PIPEDREAM_DELETE_CAPTURE_ACCOUNT = '${process.env.PIPEDREAM_DELETE_CAPTURE_ACCOUNT}'
`;
fs.writeFile(targetPath, envConfigFile, err => {
  if (err) {
    throw console.error(err);
  }
  console.log(`A secret file has generated successfully at ${targetPath} \n`);
});
