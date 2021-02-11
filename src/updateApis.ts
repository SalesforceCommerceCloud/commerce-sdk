/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import path from "path";
import fs from "fs-extra";
import { updateApis } from "./lib/utils";
import {
  API_FAMILIES,
  PRODUCTION_API_PATH,
  CUSTOM_METADATA,
  STAGING_API_PATH,
} from "./lib/config";

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
