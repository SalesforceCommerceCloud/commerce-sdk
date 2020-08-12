/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { download } from "@commerce-apps/raml-toolkit";
import path from "path";
import fs from "fs-extra";

const API_FAMILIES = [
  "pricing",
  "customer",
  "checkout",
  "search",
  "product",
  "cdn",
];

const PRODUCTION_API_PATH = `${__dirname}/../apis`;
const STAGING_API_PATH = `${__dirname}/../testIntegration/stagingApis`;
const CUSTOM_METADATA = {
  shopperAuthClient: "Customer.ShopperCustomers",
  shopperAuthApi: "authorizeCustomer",
};

async function updateApis(
  apiFamily: string,
  deployment: RegExp,
  rootPath: string
): Promise<void> {
  try {
    const apis = await download.search(
      `category:"CC API Family" = "${apiFamily}"`,
      deployment
    );
    await download.downloadRestApis(apis, path.join(rootPath, apiFamily));
  } catch (e) {
    console.error(e);
  }
}

// DOWNLOAD PRODUCTION DATA
fs.ensureDirSync(PRODUCTION_API_PATH);
fs.writeJSONSync(
  path.join(PRODUCTION_API_PATH, ".metadata.json"),
  CUSTOM_METADATA
);

API_FAMILIES.map((family) =>
  updateApis(family, /production/i, PRODUCTION_API_PATH)
);

// DOWNLOAD STAGING DATA
fs.ensureDirSync(STAGING_API_PATH);
fs.writeJSONSync(
  path.join(STAGING_API_PATH, ".metadata.json"),
  CUSTOM_METADATA
);
API_FAMILIES.map((family) => updateApis(family, /staging/i, STAGING_API_PATH));
