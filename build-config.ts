/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

export default {
  inputDir: process.env.COMMERCE_SDK_INPUT_DIR || `${__dirname}/apis`,
  renderDir:
    process.env.COMMERCE_SDK_RENDER_DIR || `${__dirname}/renderedTemplates`,
  apiConfigFile: process.env.COMMERCE_SDK_API_CONFIG_FILE || "api-config.json",
  shopperAuthClient:
    process.env.COMMERCE_SDK_SHOPPER_AUTH_CLIENT || "Customer.ShopperCustomers",
  shopperAuthApi:
    process.env.COMMERCE_SDK_SHOPPER_AUTH_API || "authorizeCustomer",
};
