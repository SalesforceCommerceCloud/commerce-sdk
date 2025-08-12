/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import path from "path";
import fs from "fs-extra";
import { PRODUCTION_API_PATH } from "./lib/config";

/**
 * Recursively removes all files ending in '-internal.yaml' from a directory and its subdirectories
 * @param directoryPath - The path to the directory to process
 */
export function removeInternalOas(directoryPath: string): void {
  if (!fs.existsSync(directoryPath)) {
    console.warn(`Directory does not exist: ${directoryPath}`);
    return;
  }

  const items = fs.readdirSync(directoryPath);

  items.forEach((item) => {
    const fullPath = path.join(directoryPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Recursively process subdirectories
      removeInternalOas(fullPath);
    } else if (stat.isFile() && item.endsWith("-internal.yaml")) {
      // Remove internal files
      fs.removeSync(fullPath);
      console.log(`Removed internal file: ${fullPath}`);
    }
  });
}

// Run the function if this file is executed directly
if (require.main === module) {
  console.log(`Removing internal OAS files from: ${PRODUCTION_API_PATH}`);
  removeInternalOas(PRODUCTION_API_PATH);
  console.log("Internal OAS files removal completed.");
}
