/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Get refresh token for a guest user
 * Usage: ts-node examples/03-refresh-auth-token.ts
 * For more information, see [Get started with Salesforce Commerce B2C APIs](https://developer.salesforce.com/docs/commerce/commerce-api/guide/get-started.html).
 */
import { ClientConfig, Customer } from "commerce-sdk";

// demo client credentials, if you have access to your own please replace them below.
// do not store client secret as plaintext. Store it in a secure location.
const CLIENT_ID = "da422690-7800-41d1-8ee4-3ce983961078";
const CLIENT_SECRET = "D*HHUrgO2%qADp2JTIUi";
const ORG_ID = "f_ecom_zzte_053";
const SHORT_CODE = "kv7kzm78";
const SITE_ID = "RefArch";

// client configuration parameters
const clientConfig: ClientConfig = {
  parameters: {
    clientId: CLIENT_ID,
    organizationId: ORG_ID,
    shortCode: SHORT_CODE,
    siteId: SITE_ID,
  },
};

/**
 * Get the shopper or guest JWT/access token, along with a refresh token, using client credentials
 *
 * @returns guest user authorization token
 */
async function getGuestUserAuthToken(): Promise<Customer.ShopperLogin.TokenResponse> {
  const credentials = `${CLIENT_ID}:${CLIENT_SECRET}`;
  const base64data = Buffer.from(credentials).toString("base64");
  const headers = { Authorization: `Basic ${base64data}` };
  const client = new Customer.ShopperLogin(clientConfig);

  return await client.getAccessToken({
    headers,
    body: {
      grant_type: "client_credentials",
    },
  });
}

/**
 * Get a new auth token using refresh token
 *
 * @param refreshToken - Valid refresh token
 * @returns New token with updated expiry time
 */
async function getNewTokenUsingRefreshToken(
  refreshToken: string
): Promise<Customer.ShopperLogin.TokenResponse> {
  const credentials = `${CLIENT_ID}:${CLIENT_SECRET}`;
  const base64data = Buffer.from(credentials).toString("base64");
  const headers = { Authorization: `Basic ${base64data}` };
  const client = new Customer.ShopperLogin(clientConfig);

  const response = await client.getAccessToken({
    headers,
    body: {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    },
  });

  return response;
}

/**
 * Get auth token and then use it to get a refresh token
 */
getGuestUserAuthToken()
  .then((authToken) => {
    console.log(`Authorization Token: ${authToken.access_token}`);
    console.log(`Token expires in ${authToken.expires_in} seconds`);
    return getNewTokenUsingRefreshToken(authToken.refresh_token);
  })
  .then((newToken) => {
    console.log(`New Token: ${newToken.access_token}`);
    console.log(`Token expires in ${newToken.expires_in} seconds`);
  })
  .catch((error) => {
    console.log(`Error fetching token: ${error}`);
  });
