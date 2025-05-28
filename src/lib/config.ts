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
/**
 * Map of API asset ID to CCDC object ID, used to generate documentation URLs
 */
export const ASSET_OBJECT_MAP = {
  assignments: "a003k00000UHvoaAAD",
  campaigns: "a003k00000UHvobAAD",
  catalogs: "a003k00000UHvofAAD",
  "cdn-api-process-apis": "a003k00000UIKk2AAH",
  coupons: "a003k00000UHvopAAD",
  customers: "a003k00000UHvouAAD",
  "einstein-api-quick-start-guide": "a003k00000UI4hPAAT",
  "gift-certificates": "a003k00000UHvozAAD",
  orders: "a003k00000UHvp4AAD",
  products: "a003k00000UHvovAAD",
  promotions: "a003k00000UHvp9AAD",
  "shopper-baskets": "a003k00000UHvpEAAT",
  "shopper-customers": "a003k00000UHvpJAAT",
  "shopper-gift-certificates": "a003k00000UHvogAAD",
  "shopper-orders": "a003k00000UHvpFAAT",
  "shopper-products": "a003k00000UHvp0AAD",
  "shopper-promotions": "a003k00000UHvp5AAD",
  "shopper-search": "a003k00000UHwuFAAT",
  "shopper-stores": "a003k00000UHwuPAAT",
  "source-code-groups": "a003k00000UHvpTAAT",
  "shopper-login": "a003k00000VWfNDAA1",
  "slas-admin": "a003k00000VzoEyAAJ",
  "inventory-availability": "a003k00000Wa43pAAB",
  impex: "a003k00000Wa43kAAB",
  "inventory-reservation-service": "a003k00000Wa43fAAB",
  "shopper-discovery-search": "a003k00000W0WlBAAV",
};

export const API_FAMILIES = [
  "assignments-oas",
  "campaigns-oas",
  "catalogs-oas",
  // "cdn-api-process-apis", // exchangeDownload returns Error: Cannot read properties of null (reading 'externalLink')
  "coupons-oas",
  // "cors-preferences-oas", // diff failed: duplicate endpoint (DELETE /organizations/{organizationId}/cors)
  "customers-oas",
  "gift-certificates-oas",
  // "orders-oas", // Error: failed to load base specs from glob "updateApisTmp/oldApis/**/*.yaml": failed to load "updateApisTmp/oldApis/orders-oas/orders-oas/orders-oas-v1-bundled.yaml": failed to unmarshal data: json error: invalid character 'o' looking for beginning of value, yaml error: error unmarshaling JSON: while decoding JSON: json: cannot unmarshal array into field Schema.items of type openapi3.Schema
  // "products-oas", // Error: diff failed: duplicate endpoint (GET /organizations/{organizationId}/products/{id}) found in apis/products-oas/products-oas/products-oas-v1-bundled.yaml and apis/products-oas/products-oas-test/products-oas-test-v1-bundled.yaml. You may add the x-since-date extension to specify order
  "preferences-oas",
  "promotions-oas",
  "search-oas",
  "seo-oas",
  "slas-admin-oas",
  "source-code-groups-oas",
];

export const PRODUCTION_API_PATH = `${__dirname}/../../apis`;
export const STAGING_API_PATH = `${__dirname}/../../testIntegration/stagingApis`;

export const CUSTOM_METADATA = {
  shopperAuthClient: "Customer.ShopperCustomers",
  shopperAuthApi: "authorizeCustomer",
  shopperAuthDataType: "Customer",
};
