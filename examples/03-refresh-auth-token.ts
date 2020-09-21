/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Get refresh token for a guest user
 * Usage: ts-node examples/03-refresh-auth-token.ts
 * Note: Replace configuration parameters before running
 */

import { ClientConfig, Customer, helpers } from "../dist";
import {
  getObjectFromResponse,
  ResponseError,
  ShopperToken,
  stripBearer,
} from "@commerce-apps/core";

import ShopperCustomers = Customer.ShopperCustomers;

//client configuration parameters
const clientConfig: ClientConfig = {
  parameters: {
    clientId: "your-client-id",
    organizationId: "your-org-id",
    shortCode: "your-short-code",
    siteId: "your-site-id",
  },
};

/**
 * Get a refresh token
 *
 * @param shopperToken - Valid authorization token
 * @returns New token with updated expiry time
 */
async function getRefreshToken(
  shopperToken: ShopperToken<ShopperCustomers.Customer>
): Promise<ShopperToken<ShopperCustomers.Customer>> {
  const headers = { Authorization: shopperToken.getBearerHeader() };

  const client = new Customer.ShopperCustomers(clientConfig);

  const response: Response = await client.authorizeCustomer(
    { headers: headers, body: { type: "refresh" } },
    true
  );
  if (!response.ok) {
    throw new ResponseError(response);
  }
  const customerInfo: Customer.ShopperCustomers.Customer = await getObjectFromResponse(
    response
  );

  return new ShopperToken(
    customerInfo,
    stripBearer(response.headers.get("Authorization"))
  );
}

/**
 * Get auth token and then use it to get a refresh token
 */
helpers
  .getShopperToken(clientConfig, { type: "guest" })
  .then((authToken) => {
    console.log(
      "Authorization Token: ",
      authToken.getAuthToken(),
      ", Expiry Time: ",
      new Date(authToken.decodedToken["exp"] * 1000)
    );
    return getRefreshToken(authToken);
  })
  .then((refreshToken) =>
    console.log(
      "Refresh Token: ",
      refreshToken.getAuthToken(),
      ", Expiry Time: ",
      new Date(refreshToken.decodedToken["exp"] * 1000)
    )
  )
  .catch((error) => {
    console.log(`Error fetching token: ${error}`);
  });
