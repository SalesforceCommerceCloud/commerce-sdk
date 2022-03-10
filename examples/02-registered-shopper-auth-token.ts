/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Get authorization token for a registered customer
 * Usage: ts-node examples/02-registered-shopper-auth-token.ts
 * Note: Replace configuration parameters and client credentials before running
 */
import { ClientConfig, Customer } from "../dist";
import { getObjectFromResponse } from "@commerce-apps/core";

// client credentials
const CLIENT_ID = "da422690-7800-41d1-8ee4-3ce983961078";
const CLIENT_SECRET = "D*HHUrgO2%qADp2JTIUi";

// client configuration parameters
const clientConfig: ClientConfig = {
  parameters: {
    clientId: CLIENT_ID,
    organizationId: "f_ecom_zzte_053",
    shortCode: "kv7kzm78",
    siteId: "RefArch",
  },
};

/**
 * Get token for the registered customer
 *
 * @returns authorization token
 */
async function getRegisteredShopperToken() {
  const credentials = `${CLIENT_ID}:${CLIENT_SECRET}`;
  const base64data = Buffer.from(credentials).toString("base64");
  const headers = { Authorization: `Basic ${base64data}` };
  const client = new Customer.ShopperLogin(clientConfig);

  const response = await client.getAccessToken(
    {
      headers,
      body: {
        grant_type: "client_credentials",
      },
    },
    true
  );

  const responseObject: any = await getObjectFromResponse(response);

  return responseObject.access_token;
}

getRegisteredShopperToken()
  .then((shopperToken) => console.log(`Authorization token: ${shopperToken}`))
  .catch((error) => {
    console.log(`Error fetching token for registered customer: ${error}`);
  });
