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
import { helpers, ClientConfig } from "../dist";

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
 * Invoke helper function to retrieve the authorization token for the guest user
 * Doc: https://salesforcecommercecloud.github.io/commerce-sdk/modules/_helpers_.html#getshoppertoken
 */
helpers
  .getShopperToken(clientConfig, { type: "guest" })
  .then((shopperToken) => {
    console.log("Authorization token: ", shopperToken.getAuthToken());
    console.log("Customer Info: ", shopperToken.getCustomerInfo());
  })
  .catch((error) => {
    console.log(`Error fetching token: ${error}`);
  });
