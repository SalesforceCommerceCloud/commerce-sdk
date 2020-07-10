/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

export default {
  inputDir: process.env.COMMERCE_SDK_INPUT_DIR || `${__dirname}/apis`,
  updateApiDir:
    process.env.COMMERCE_SDK_UPDATE_API_DIR || `${__dirname}/updateApiTmpDir`,
  renderDir:
    process.env.COMMERCE_SDK_RENDER_DIR || `${__dirname}/renderedTemplates`,

  // TODO: This this should become 'group by' and provide a method to pickout the metadata you want to group by
  apiFamily: process.env.COMMERCE_SDK_API_FAMILY || "CC API Family",
  exchangeSearch:
    process.env.COMMERCE_SDK_EXCHANGE_SEARCH ||
    'category:"CC Visibility" = "External"',
  apiConfigFile: process.env.COMMERCE_SDK_API_CONFIG_FILE || "api-config.json",
  shopperAuthClient:
    process.env.COMMERCE_SDK_SHOPPER_AUTH_CLIENT || "Customer.ShopperCustomers",
  shopperAuthApi:
    process.env.COMMERCE_SDK_SHOPPER_AUTH_API || "authorizeCustomer",
  exchangeDeploymentRegex: RegExp(
    process.env.COMMERCE_SDK_EXCHANGE_DEPLOYMENT_REGEX || /production/i
  ),
};
