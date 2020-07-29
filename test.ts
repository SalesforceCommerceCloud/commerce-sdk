/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { common, getBearer } from "@commerce-apps/raml-toolkit";
import fs from "fs-extra";
import {
  searchExchange,
  downloadRestApis,
} from "@commerce-apps/raml-toolkit/lib/download/exchangeDownloader";
import { renderTemplates } from "./src/renderer";
import { indexTemplate } from "./src/handlebarsConfig";

async function createSdk() {
  const apis = await common.createApiTree("./newApis");
  fs.ensureDirSync("newPipeline");
  fs.writeFileSync("newPipeline/index.ts", indexTemplate(apis));
}

async function updateApis(apiFamily) {
  const token = await getBearer(
    process.env.ANYPOINT_USERNAME,
    process.env.ANYPOINT_PASSWORD
  );
  const apis = await searchExchange(
    token,
    `category:"CC API Family" = "${apiFamily}"`
  );
  await downloadRestApis(apis, `newApis/${apiFamily}`);
}

// updateApis("pricing");
// updateApis("customer");
// updateApis("checkout");
// updateApis("search");
// updateApis("product");
// updateApis("cdn");
// updateApis("seller");

createSdk();
