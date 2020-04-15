/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { helpers, Customer } from "./renderedTemplates";

import { ShopperToken } from "@commerce-apps/core";

console.log(Customer.ShopperCustomers);

const clientConfig = {
  parameters: {
    clientId: "f66f0e4f-fa44-41eb-9b35-89de9ee67e71",
    organizationId: "f_ecom_zzeu_015",
    siteId: "SiteGenesis",
    shortCode: "0dnz6oep"
  }
};
// let test: Customer.ShopperCustomers.

helpers
  .getShopperToken(clientConfig, {
    type: "guest"
  })
  .then((token: ShopperToken) => {
    // Log the token
    console.log(token);
    clientConfig["headers"] = {
      Authorization: token.getBearerHeader()
    };
    const customerClient = new Customer.ShopperCustomers(clientConfig);
    customerClient.getCustomer();
  });
