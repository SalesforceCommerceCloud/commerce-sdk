/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { spawnSync } from "child_process";
import path from "path";
import fs from "fs-extra";
import dotenv from "dotenv";
import {
  fetchEcomBundles,
  loadBundledApi,
  replaceApis,
  resolveEcomOasRef,
  stageApi,
} from "./lib/ecomOas";
import {
  parseEcomVersionArg,
  parseSingleApiArgs,
  readApiVersions,
  rejectUnknownArgs,
  setEcomVersionHeader,
} from "./lib/utils";
import { API_VERSIONS_FILE, PRODUCTION_API_PATH } from "./lib/config";

dotenv.config();

const OLD_APIS_PATH = path.join(__dirname, "../temp/oldApis");
const STAGED_APIS_PATH = path.join(__dirname, "../temp/stagedApis");
const ECOM_CHECKOUT_PATH = path.join(__dirname, "../temp/ecom-oas");
const DIFF_REPORT_PATH = path.join(__dirname, "../temp/diffApis.txt");
const DIFF_INPUT_PATH = path.join(__dirname, "../temp/diff");

// raml-toolkit's diff treats a folder as an API only if it holds an exchange.json, and
// never reads the file. `apis/` has none, so the diff runs on scratch copies carrying an
// empty marker. Drop this when the diff no longer uses raml-toolkit.
function prepareDiffInputs(): void {
  fs.removeSync(DIFF_INPUT_PATH);
  [
    ["old", OLD_APIS_PATH],
    ["new", PRODUCTION_API_PATH],
  ].forEach(([name, source]) => {
    const target = path.join(DIFF_INPUT_PATH, name);
    fs.copySync(source, target);
    fs.readdirSync(target)
      .map((entry) => path.join(target, entry))
      .filter((entryPath) => fs.statSync(entryPath).isDirectory())
      .forEach((folder) => {
        fs.writeFileSync(path.join(folder, "exchange.json"), "{}");
      });
  });
}

/**
 * Populates `apis/` from the ECOM monorepo.
 *
 * `api-versions.txt` is the allow-list of which APIs to ship, and records where
 * ECOM publishes each one's bundle, so only those directories are fetched. New ECOM
 * APIs are not exposed by the SDK until someone adds them there.
 *
 * Two modes:
 * - Release refresh (default): every allow-listed API is refreshed from the release
 *   branch named by the `# APIs for ECOM vXX.Y` header, `--ecom-version`, or
 *   `ECOM_OAS_REF`.
 * - Partial update (`--api <key> --ref <ref>`): only the named APIs are refreshed,
 *   from any ECOM ref, and every other folder in `apis/` is left untouched.
 *
 * Output is built in a staging directory and copied into `apis/` only once every
 * fetch and check has succeeded, so those failures never touch `apis/`.
 */
function updateApis(): void {
  const argv = process.argv.slice(2);
  rejectUnknownArgs(argv);
  const ecomVersion = parseEcomVersionArg(argv);
  const partial = parseSingleApiArgs(argv);
  const allowList = new Map(
    readApiVersions().map(({ apiName, bundlePath }) => [apiName, bundlePath])
  );

  const requested = partial
    ? [...new Set(partial.apis)]
    : [...allowList.keys()];
  const unknown = requested.filter((key) => !allowList.has(key));
  if (unknown.length) {
    throw new Error(
      `${unknown.join(
        ", "
      )} not in api-versions.txt; add it there first so the SDK is meant to ship it`
    );
  }
  const bundlePaths = requested.map((key) => allowList.get(key) as string);

  const apiVersionsContent = fs.readFileSync(API_VERSIONS_FILE, "utf-8");
  if (ecomVersion) {
    // Fails before anything changes if the header is missing.
    setEcomVersionHeader(apiVersionsContent, ecomVersion);
    if (process.env.ECOM_OAS_REF?.trim()) {
      throw new Error(
        "--ecom-version cannot be used while ECOM_OAS_REF is set: the header would name a release the specs did not come from. Unset ECOM_OAS_REF."
      );
    }
  }

  const ref = partial ? partial.ref : resolveEcomOasRef(ecomVersion);
  // Printed before the fetch so it is seen even when the run fails or scrolls away.
  if (!partial && process.env.ECOM_OAS_REF?.trim()) {
    console.warn(
      `WARNING: ECOM_OAS_REF=${ref} overrides the release branch, so these specs are not from the ECOM release named in api-versions.txt. Unset it before a release.`
    );
  }

  console.log(`Fetching ${requested.length} ECOM bundle(s) at ref ${ref}`);
  const { bundlesPath, commit } = fetchEcomBundles(
    ECOM_CHECKOUT_PATH,
    ref,
    bundlePaths
  );
  console.log(`Resolved ${ref} to ECOM commit ${commit}`);

  // Load every bundle before staging any, so one bad API fails the run up front.
  const apis = requested.map((key, index) =>
    loadBundledApi(bundlesPath, key, bundlePaths[index])
  );

  fs.removeSync(STAGED_APIS_PATH);
  fs.ensureDirSync(STAGED_APIS_PATH);
  console.log(`\nStaged ${apis.length} API(s):`);
  apis.forEach((api) => {
    const folderName = stageApi(api, STAGED_APIS_PATH);
    console.log(`  ${api.assetId}-${api.apiVersion} -> ${folderName}`);
  });

  replaceApis({
    stagedDir: STAGED_APIS_PATH,
    apisDir: PRODUCTION_API_PATH,
    backupDir: OLD_APIS_PATH,
    keys: partial ? requested : undefined,
  });

  if (ecomVersion) {
    fs.writeFileSync(
      API_VERSIONS_FILE,
      setEcomVersionHeader(apiVersionsContent, ecomVersion)
    );
    console.log(`Set the api-versions.txt header to ECOM v${ecomVersion}`);
  }

  console.log("\nECOM API update completed successfully");
}

// Run here rather than chained in package.json: npm appends command-line arguments
// to the end of the script string, so `--api` would reach diffApis instead of this
// script. diffApis exits 1 when it finds differences, which is the expected outcome
// of an update; anything else means the diff itself failed.
// The report is removed first because raml-toolkit writes it only when it finds
// differences, so a clean run would otherwise leave the previous run's report behind.
function diffUpdatedApis(): void {
  fs.removeSync(DIFF_REPORT_PATH);
  prepareDiffInputs();
  const diff = spawnSync("npm", ["run", "diffApis"], { stdio: "inherit" });
  if (diff.status === 0) {
    console.log("diffApis found no differences");
  } else if (diff.status === 1) {
    console.log("diffApis found differences, see temp/diffApis.txt");
  } else {
    throw new Error(
      `diffApis failed (exit ${String(
        diff.status
      )}); apis/ is updated but not diffed`
    );
  }
}

if (require.main === module) {
  try {
    updateApis();
    diffUpdatedApis();
  } catch (error) {
    console.error(
      "Error during ECOM API update:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}
