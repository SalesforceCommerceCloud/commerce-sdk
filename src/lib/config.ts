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
  // "cors-preferences-oas", // This is included in preferences-oas. Error: diff failed: duplicate endpoint (PUT /organizations/{organizationId}/cors) found in apis/cors-preferences-oas/cors-preferences-oas/cors-preferences-oas-v1-bundled.yaml and apis/preferences-oas/cors-preferences-oas/cors-preferences-oas-v1-bundled.yaml. You may add the x-since-date extension to specify order
  "customers-oas",
  "gift-certificates-oas",
  "orders-oas", // Error: failed to load base specs from glob "updateApisTmp/oldApis/**/*.yaml": failed to load "updateApisTmp/oldApis/orders-oas/orders-oas/orders-oas-v1-bundled.yaml": failed to unmarshal data: json error: invalid character 'o' looking for beginning of value, yaml error: error unmarshaling JSON: while decoding JSON: json: cannot unmarshal array into field Schema.items of type openapi3.Schema
  "products-oas", // Error: diff failed: duplicate endpoint (GET /organizations/{organizationId}/products/{id}) found in apis/products-oas/products-oas/products-oas-v1-bundled.yaml and apis/products-oas/products-oas-test/products-oas-test-v1-bundled.yaml. You may add the x-since-date extension to specify order
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
];

export const PRODUCTION_API_PATH = `${__dirname}/../../apis`;

export const CUSTOM_METADATA = {
  shopperAuthClient: "Customer.ShopperCustomers",
  shopperAuthApi: "authorizeCustomer",
  shopperAuthDataType: "Customer",
};
