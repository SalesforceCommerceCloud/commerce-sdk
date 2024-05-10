/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
export const TYPESCRIPT_DTO_EXT = ".types.ts";
export const PRIMITIVE_DATA_TYPE_MAP = {
  "http://www.w3.org/2001/XMLSchema#string": "string",
  "http://www.w3.org/2001/XMLSchema#integer": "number",
  "http://www.w3.org/2001/XMLSchema#double": "number",
  "http://www.w3.org/2001/XMLSchema#float": "number",
  "http://www.w3.org/2001/XMLSchema#boolean": "boolean",
};

export const API_FAMILIES = [
  "cdn",
  "checkout",
  "customer",
  "discovery",
  "experience",
  "pricing",
  "product",
  "search",
  "seller",
];

export const PRODUCTION_API_PATH = `${__dirname}/../../apis`;
export const STAGING_API_PATH = `${__dirname}/../../testIntegration/stagingApis`;

// Root level metadata shared by production and staging APIs
export const COMMON_METADATA = {
  shopperAuthClient: "Customer.ShopperCustomers",
  shopperAuthApi: "authorizeCustomer",
  shopperAuthDataType: "Customer",
};
