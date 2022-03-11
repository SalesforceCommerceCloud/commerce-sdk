/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Get authorization token for a registered customer
 * Usage: ts-node examples/02-registered-shopper-auth-token.ts
 */
import { ClientConfig, Customer } from "commerce-sdk";

// client credentials
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
 * Get token for the registered customer
 *
 * @returns authorization token
 */
async function getRegisteredShopperToken(): Promise<Customer.ShopperLogin.TokenResponse> {
  const credentials = `${CLIENT_ID}:${CLIENT_SECRET}`;
  const base64data = Buffer.from(credentials).toString("base64");
  const headers = { Authorization: `Basic ${base64data}` };
  const client = new Customer.ShopperLogin(clientConfig);

  const response: Customer.ShopperLogin.TokenResponse =
    await client.getAccessToken({
      headers,
      body: {
        grant_type: "client_credentials",
      },
    });

  return response;
}

getRegisteredShopperToken()
  .then((shopperToken) =>
    console.log(`Authorization token: ${shopperToken.access_token}`)
  )
  .catch((error) => {
    console.log(`Error fetching token for registered customer: ${error}`);
  });
