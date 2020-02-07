/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
export default {
  inputDir: "test/raml/valid/",
  renderDir: "renderedTemplates",
  apiFamily: "CC API Family",
  exchangeSearch: 'category:"CC Visibility" = "External"',
  apiConfigFile: "api-config.json",
  shopperAuthClient: "Customer.ShopperCustomers",
  shopperAuthApi: "authorizeCustomer",
  exchangeDeploymentRegex: /production/i
};
