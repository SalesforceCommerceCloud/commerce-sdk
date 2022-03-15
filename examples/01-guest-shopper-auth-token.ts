/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Get authorization token for a guest user
 * Usage: ts-node examples/01-guest-shopper-auth-token.ts
 * Note: Replace configuration parameters before running
 */
import { ClientConfig, Customer } from "commerce-sdk";

// demo client credentials, if you have access to your own please replace them below.
// The client secret should not be stored in plain text alongside code. Please store the secret in a secure location.
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

  const response = await client.getAccessToken({
    headers,
    body: {
      grant_type: "client_credentials",
    },
  });

  return response;
}

getAuthToken()
  .then((shopperToken) =>
    console.log(`Authorization token: ${shopperToken.access_token}`)
  )
  .catch((error) => {
    console.log(`Error fetching token for the guest user: ${error}`);
  });
