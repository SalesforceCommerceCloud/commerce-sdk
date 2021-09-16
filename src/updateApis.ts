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
  COMMON_METADATA,
  STAGING_API_PATH,
} from "./lib/config";

// DOWNLOAD PRODUCTION DATA
fs.ensureDirSync(PRODUCTION_API_PATH);
fs.writeJSONSync(path.join(PRODUCTION_API_PATH, ".metadata.json"), {
  ...COMMON_METADATA,
  // We don't want to publish APIs that don't have documentation in the CCDC,
  // so the build should fail if the CCDC ID is missing for an API.
  enforceCcdcId: true,
});

API_FAMILIES.map((family) =>
  updateApis(family, /production/i, PRODUCTION_API_PATH)
);

// DOWNLOAD STAGING DATA
fs.ensureDirSync(STAGING_API_PATH);
fs.writeJSONSync(path.join(STAGING_API_PATH, ".metadata.json"), {
  ...COMMON_METADATA,
  // Staging APIs aren't published yet, so we don't need to care if they don't
  // have an associated CCDC ID.
  enforceCcdcId: false,
});

API_FAMILIES.map((family) => updateApis(family, /staging/i, STAGING_API_PATH));
