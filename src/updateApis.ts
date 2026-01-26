/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import path from "path";
import fs from "fs-extra";
import { downloadApisWithAnypointCli, readApiVersions } from "./lib/utils";
import { PRODUCTION_API_PATH, ORG_ID } from "./lib/config";
import dotenv from "dotenv";
import { removeInternalOas } from "./removeInternalOas";

dotenv.config();

// Constants
const OLD_APIS_PATH = path.join(__dirname, "../temp/oldApis");

/**
 * Main function to update APIs based on versions in api-versions.txt
 */
async function updateApis(): Promise<void> {
  // Check for required environment variables
  if (!process.env.ANYPOINT_USERNAME || !process.env.ANYPOINT_PASSWORD) {
    throw new Error(
      "Please ensure that ANYPOINT_USERNAME and ANYPOINT_PASSWORD environment variables are set."
    );
  }

  try {
    // Create a backup of existing APIs
    if (fs.existsSync(PRODUCTION_API_PATH)) {
      console.log(`Backing up existing APIs to ${OLD_APIS_PATH}`);
      await fs.move(PRODUCTION_API_PATH, OLD_APIS_PATH, { overwrite: true });
    }

    // Ensure target directory exists
    await fs.ensureDir(PRODUCTION_API_PATH);

    // Read API versions and download each one
    const apiVersions = readApiVersions();

    // Process all API versions in sequence
    await apiVersions.reduce(async (previousPromise, { apiName, version }) => {
      // Wait for the previous API to finish processing
      await previousPromise;

      // Strip version suffix (e.g., -v1, -v2) from API name for Exchange ID
      const baseApiName = apiName.replace(/-(v\d+)$/, "");
      const apiId = `${ORG_ID}/${baseApiName}/${version}`;
      console.log(`Processing API: ${apiId}`);

      // Only use the base semantic version without SNAPSHOT or branch build suffixes 1.2.0-master-b70 = 1.2.0
      const versionWithoutSuffix = version.includes("-")
        ? version.substring(0, version.indexOf("-"))
        : version;

      const apiFolderName = `${baseApiName}-${versionWithoutSuffix}`;
      // throws error if download fails
      await downloadApisWithAnypointCli(
        apiId,
        path.join(PRODUCTION_API_PATH, apiFolderName),
        ORG_ID
      );
      console.log(`Successfully updated ${apiName} to version ${version}`);
    }, Promise.resolve());

    console.log("API update process completed successfully");
  } catch (error) {
    console.error(
      "Error during API update process:",
      error instanceof Error ? error.message : String(error)
    );

    // Restore from backup if something went wrong
    console.log("Restoring APIs from backup...");
    await fs.move(OLD_APIS_PATH, PRODUCTION_API_PATH, { overwrite: true });

    process.exit(1);
  }
}

if (require.main === module) {
  updateApis()
    .then(() => {
      removeInternalOas(OLD_APIS_PATH);
      removeInternalOas(PRODUCTION_API_PATH);
    })
    .catch((error) => {
      console.error("Unhandled error:", error);
      process.exit(1);
    });
}
