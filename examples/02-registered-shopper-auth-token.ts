/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Get authorization token for a registered customer
 * Usage: ts-node examples/02-registered-shopper-auth-token.ts
 * Note: Replace configuration parameters and user credentials before running
 */
import { ClientConfig, Customer } from "../dist";
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

//customer credentials
const username = "username";
const password = "password";

/**
 * Get token for the registered customer
 *
 * @returns authorization token
 */
async function getRegisteredShopperToken(): Promise<
  ShopperToken<ShopperCustomers.Customer>
> {
  const credentials = `${username}:${password}`;
  const buff = Buffer.from(credentials);
  const base64data = buff.toString("base64");
  const headers = { Authorization: `Basic ${base64data}` };

  const client = new ShopperCustomers(clientConfig);

  const response: Response = await client.authorizeCustomer(
    { headers: headers, body: { type: "credentials" } },
    true
  );
  if (!response.ok) {
    throw new ResponseError(response);
  }
  const customerInfo: ShopperCustomers.Customer = await getObjectFromResponse(
    response
  );

  return new ShopperToken(
    customerInfo,
    stripBearer(response.headers.get("Authorization"))
  );
}

getRegisteredShopperToken()
  .then((shopperToken) => {
    console.log("Authorization token: ", shopperToken.getAuthToken());
    console.log("Customer Info: ", shopperToken.getCustomerInfo());
  })
  .catch((error) => {
    console.log(`Error fetching token for registered customer: ${error}`);
  });
