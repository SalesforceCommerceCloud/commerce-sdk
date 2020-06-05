/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from "path";
import _ from "lodash";

import { diffRaml, NodeDiff } from "@commerce-apps/raml-toolkit";
import { generatorLogger } from "./logger";

export type RamlDiff = {
  file: string;
  message?: string;
  diff?: NodeDiff[];
};

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
 * Finds differences between the given directories for all the raml files in the
 * provided config.
 *
 * @param oldApiDir - Existing APIs
 * @param newApiDir - Newly downloaded APIs
 * @param oldConfigPath - Existing config
 * @param newConfigPath - Config for newly created APIs
 *
 * @returns An array of RamlDiff objects containing differences between all the
 * old and new RAML files
 */
export async function diffNewAndArchivedRamlFiles(
  oldApiDir: string,
  newApiDir: string,
  oldConfigPath: string,
  newConfigPath: string
): Promise<RamlDiff[]> {
  const oldRamls = listRamlsFromConfig(oldConfigPath);
  const newRamls = listRamlsFromConfig(newConfigPath);

  const commonRamls = [];
  // Extract all RAMLs that are part of the existing and the newly downloaded
  // apis so that they can evaluated for any changes.
  for (let i = 0; i < oldRamls.length; i++) {
    if (newRamls.includes(oldRamls[i])) {
      commonRamls.push(oldRamls[i]);
      oldRamls[i] = null;
    }
  }

  const result: RamlDiff[] = [];
  // Get diffs for all the common RAMLs. If diff operation fails for a RAML,
  // log the error, add a message to the diff object and continue with the rest
  // of the RAML files.
  for (const raml of commonRamls) {
    const leftRaml = path.join(oldApiDir, raml);
    const rightRaml = path.join(newApiDir, raml);
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
  const removedRamls: RamlDiff[] = oldRamls
    .filter(r => r)
    .map(r => ({ file: r, message: "This RAML has been removed" }));
  const addedRamls: RamlDiff[] = newRamls
    .filter(r => !commonRamls.includes(r))
    .map(r => ({ file: r, message: "This RAML has been added recently" }));

  return result.concat(removedRamls, addedRamls);
}
