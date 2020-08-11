/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

///// ALL SHOULD BE ONE IMPORT!!!!
import { getBearer } from "@commerce-apps/raml-toolkit";
import {
  searchExchange,
  downloadRestApis,
} from "@commerce-apps/raml-toolkit/lib/download/exchangeDownloader";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
