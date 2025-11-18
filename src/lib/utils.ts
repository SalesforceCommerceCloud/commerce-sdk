/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { execSync } from "child_process";
import path from "path";
import fs from "fs-extra";
import AdmZip from "adm-zip";

export const API_VERSIONS_FILE = path.join(__dirname, "../../api-versions.txt");
export const ORG_ID = "893f605e-10e2-423a-bdb4-f952f56eb6d8";

/**
 * Downloads API assets using anypoint-cli-v4 and extracts them to the target directory.
 *
 * @param apiId - The API ID in Anypoint Exchange
 * @param targetDir - Directory where the API assets should be extracted
 * @param orgId - the organization ID to download the API from
 * @returns Promise that resolves when the download and extraction is complete
 */
export async function downloadApisWithAnypointCli(
  apiId: string,
  targetDir: string,
  orgId: string
): Promise<void> {
  try {
    // Create a temporary directory for the download
    const tempDir = path.join(process.cwd(), "temp", "downloads");
    await fs.ensureDir(tempDir);

    // Build the command with proper quoting for special characters
    const username = process.env.ANYPOINT_USERNAME || "";
    const password = process.env.ANYPOINT_PASSWORD || "";

    const cmd = `anypoint-cli-v4 exchange:asset:download ${apiId} ${tempDir} --username '${username}' --password '${password}' --organization=${orgId}`;

    // Execute the command
    console.log(`Downloading API ${apiId} using anypoint-cli...`);

    try {
      execSync(cmd, {
        stdio: "inherit",
        cwd: process.cwd(),
        env: process.env,
      });
    } catch (error) {
      throw new Error(
        `Failed to download API ${apiId}: potential reasons: api or version does not exist, wrong credentials, wrong organization ID`
      );
    }

    // Find the downloaded zip file
    const files = await fs.readdir(tempDir);
    const zipFile: string | undefined = files.find((file: string) =>
      file.endsWith(".zip")
    );

    if (!zipFile) {
      throw new Error(`No zip file found in ${tempDir}`);
    }

    const zipPath = path.join(tempDir, zipFile);
    console.log(`Extracting ${zipFile} to ${targetDir}...`);

    // Extract the zip file
    const zip = new AdmZip(zipPath);

    // Ensure target directory exists
    await fs.ensureDir(targetDir);

    // Extract all contents to target directory
    zip.extractAllTo(targetDir, true);

    // Clean up temporary files
    await fs.remove(tempDir);

    console.log(
      `Successfully downloaded and extracted API ${apiId} to ${targetDir}`
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to download API ${apiId}: ${error.message}`);
    }
    throw new Error(`Failed to download API ${apiId}`);
  }
}

/**
 * Reads the API versions from the api-versions.txt file
 * @returns Array of { apiName, version } objects
 */
export function readApiVersions(): Array<{ apiName: string; version: string }> {
  if (!fs.existsSync(API_VERSIONS_FILE)) {
    throw new Error(`API versions file not found at: ${API_VERSIONS_FILE}`);
  }

  const content = fs.readFileSync(API_VERSIONS_FILE, "utf-8");
  return content
    .split("\n")
    .filter((line) => line.trim() && !line.startsWith("#"))
    .map((line) => {
      const [apiName, version] = line.split("=").map((s) => s.trim());
      return { apiName, version };
    });
}
