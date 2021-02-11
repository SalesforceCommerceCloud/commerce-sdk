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
  "shopper-login-slas-admin": "a003k00000Wa43QAAR",
  "inventory-availability": "a003k00000Wa43pAAB",
  impex: "a003k00000Wa43kAAB",
  "inventory-reservation-service": "a003k00000Wa43fAAB",
};

export const API_FAMILIES = [
  "pricing",
  "customer",
  "checkout",
  "search",
  "product",
  "cdn",
  "inventory",
];

export const PRODUCTION_API_PATH = `${__dirname}/../apis`;
export const STAGING_API_PATH = `${__dirname}/../testIntegration/stagingApis`;

export const CUSTOM_METADATA = {
  shopperAuthClient: "Customer.ShopperCustomers",
  shopperAuthApi: "authorizeCustomer",
  shopperAuthDataType: "Customer",
};
