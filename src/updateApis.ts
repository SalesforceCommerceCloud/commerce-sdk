/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import path from "path";
import fs from "fs-extra";
import { downloadLatestApis } from "./lib/utils";
import {
  PRODUCTION_API_PATH,
  CUSTOM_METADATA,
} from "./lib/config";

// DOWNLOAD PRODUCTION DATA
fs.ensureDirSync(PRODUCTION_API_PATH);
fs.writeJSONSync(
  path.join(PRODUCTION_API_PATH, ".metadata.json"),
  CUSTOM_METADATA
);

downloadLatestApis(
  'category:Visibility = "External" category:"SDK Type" = "Commerce"',
  PRODUCTION_API_PATH
)