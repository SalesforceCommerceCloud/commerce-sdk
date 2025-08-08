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
  "assignments-oas",
  "campaigns-oas",
  "catalogs-oas",
  "cdn-api-process-apis-oas",
  "coupons-oas",
  "customers-oas",
  "gift-certificates-oas",
  "orders-oas",
  "products-oas",
  "preferences-oas",
  "promotions-oas",
  "search-oas",
  "seo-oas",
  "slas-admin-oas",
  "source-code-groups-oas",
  "shopper-baskets-oas",
  "shopper-context-oas",
  "shopper-experience-oas",
  "shopper-login-oas",
  "shopper-stores-oas",
  "shopper-consents-oas",
];

export const PRODUCTION_API_PATH = `${__dirname}/../../apis`;

export const CUSTOM_METADATA = {
  shopperAuthClient: "Customer.ShopperCustomers",
  shopperAuthApi: "authorizeCustomer",
  shopperAuthDataType: "Customer",
};
