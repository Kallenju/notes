// import jwt from 'jsonwebtoken';

import { getAppAccessToken } from './getAppAccessToken.js';
// import { getAppSecret } from './getAppSecret.js';

export async function getSecureRequestParams(): Promise<{
  appAccessToken: string;
}> {
  const appAccessToken = await getAppAccessToken();
  // const appSecretTime = Date.now();
  // const appSecretProof = jwt.sign(
  //   `${appAccessToken}|${appSecretTime}`,
  //   getAppSecret(),
  //   { algorithm: 'HS256' },
  // );

  // return { appAccessToken, appSecretTime, appSecretProof };
  return { appAccessToken };
}
