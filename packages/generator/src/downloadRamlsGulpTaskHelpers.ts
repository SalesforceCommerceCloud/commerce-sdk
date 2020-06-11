/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from "path";
import _ from "lodash";

import { diffRaml, RamlDiff } from "@commerce-apps/raml-toolkit";
import { generatorLogger } from "./logger";

/**
 * Extracts all the RAML file names from the specified config file.
 *
 * @param configPath - Target config file
 *
 * @returns An array of `assetId/fileName` for every api in the input file
 */
export function listRamlsFromConfig(configPath: string): string[] {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const config = require(configPath);
  const ramls = [];
  for (const apiFamily of Object.keys(config)) {
    for (const api of config[apiFamily]) {
      ramls.push(path.join(api.assetId, api.fatRaml.mainFile));
    }
  }

  return ramls;
}

/**
 * Compares the arrays to find any common or exclusive elements
 *
 * @param array1 - One of the arrays being compared
 * @param array2 - The other array being compared
 * @param common - Return all the elements that are common if true, all the
 * elements that are not common otherwise
 *
 * @returns An array of RAML files that are common or not common in both the
 * arrays
 */
function compareArrays(
  array1: string[],
  array2: string[],
  common: boolean
): string[] {
  return array1.filter(raml =>
    common ? array2.includes(raml) : !array2.includes(raml)
  );
}

/**
 * Get diffs for all the common RAMLs. If diff operation fails for a RAML, log
 * the error, add a message to the diff object and continue with the rest of the
 * RAML files.
 *
 * @param dir1 - One of the directories with raml files
 * @param dir2 - The other directory with raml files
 * @param commonRamls - List of all the ramls to be compared
 */
async function diffCommonRamls(
  dir1: string,
  dir2: string,
  commonRamls: string[]
): Promise<RamlDiff[]> {
  const result: RamlDiff[] = [];
  for (const raml of commonRamls) {
    const leftRaml = path.join(dir1, raml);
    const rightRaml = path.join(dir2, raml);
    const diffDetails: RamlDiff = { file: raml };
    try {
      diffDetails.diff = await diffRaml(leftRaml, rightRaml);
      if (!_.isEmpty(diffDetails.diff)) {
        result.push(diffDetails);
      }
    } catch (error) {
      generatorLogger.error(`Diff operation for '${raml}' failed:`, error);
      diffDetails.message = "The operation was unsuccessful";
      result.push(diffDetails);
    }
  }

  return result;
}

/**
 * Finds differences between the given directories for all the raml files in the
 * provided config.
 *
 * @param oldApiDir - Existing APIs
 * @param newApiDir - Newly downloaded APIs
 * @param configFile - Config file name
 *
 * @returns An array of RamlDiff objects containing differences between all the
 * old and new RAML files
 */
export async function diffNewAndArchivedRamlFiles(
  oldApiDir: string,
  newApiDir: string,
  configFile: string
): Promise<RamlDiff[]> {
  const oldRamls = listRamlsFromConfig(path.join(oldApiDir, configFile));
  const newRamls = listRamlsFromConfig(path.join(newApiDir, configFile));

  const commonRamls = compareArrays(oldRamls, newRamls, true);

  const result: RamlDiff[] = await diffCommonRamls(
    oldApiDir,
    newApiDir,
    commonRamls
  );

  const removedRamls: RamlDiff[] = compareArrays(
    oldRamls,
    commonRamls,
    false
  ).map(r => ({ file: r, message: "This RAML has been removed" }));
  const addedRamls: RamlDiff[] = compareArrays(
    newRamls,
    commonRamls,
    false
  ).map(r => ({ file: r, message: "This RAML has been added recently" }));

  return result.concat(removedRamls, addedRamls);
}
