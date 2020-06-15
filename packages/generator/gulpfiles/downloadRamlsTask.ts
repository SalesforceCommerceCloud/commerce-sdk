/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as gulp from "gulp";
import * as path from "path";
import fs from "fs-extra";
import _ from "lodash";

import {
  downloadRestApis,
  extractFiles,
  getBearer,
  getVersionByDeployment,
  getSpecificApi,
  groupByCategory,
  removeRamlLinks,
  removeVersionSpecificInformation,
  RestApi,
  searchExchange
} from "@commerce-apps/raml-toolkit";
import config from "../../../build-config";
import { diffNewAndArchivedRamlFiles } from "../src/downloadRamlsGulpTaskHelpers";
import { generatorLogger } from "../src/logger";

require("dotenv").config();

const apiBackupDir = path.join(config.updateApiDir, "apiBackup");
const diffFile = path.join(config.updateApiDir, "ramlDiff.json");

/**
 * Gets information about all the apis from exchange that match config.search,
 * for the version deployed in the config.exchangeDeploymentRegex environment.
 * If it fails to get information about the deployed version of an api, it
 * removes all the version specific information from `config.apiConfigFile`.
 *
 * @returns Information about the APIs found.
 */
async function search(): Promise<RestApi[]> {
  const token = await getBearer(
    process.env.ANYPOINT_USERNAME,
    process.env.ANYPOINT_PASSWORD
  );
  const apis = await searchExchange(token, config.exchangeSearch);
  const promises = [];
  apis.forEach(api => {
    promises.push(
      getVersionByDeployment(token, api, config.exchangeDeploymentRegex).then(
        (version: string) => {
          const neededApi = getSpecificApi(
            token,
            api.groupId,
            api.assetId,
            version
          );

          if (neededApi) {
            return neededApi;
          } else {
            return removeVersionSpecificInformation(api);
          }
        }
      )
    );
  });
  return Promise.all(promises).then((deployedApis: RestApi[]) => {
    return deployedApis;
  });
}

gulp.task("diffRamlFiles", async () => {
  const result = await diffNewAndArchivedRamlFiles(
    apiBackupDir,
    config.inputDir,
    config.apiConfigFile
  );
  return fs.writeJson(diffFile, result);
});

/**
 * Cleans up the temp working dir and makes a back up of the apis
 */
gulp.task("backupApis", async () => {
  fs.removeSync(config.updateApiDir);
  return fs.moveSync(config.inputDir, apiBackupDir);
});

/**
 * Groups RAML files for the given key (API Family, a.k.a Bounded Context).
 * Once grouped, renderTemplates task creates one Client per group
 *
 * @returns Promise that resolves on completion.
 */
gulp.task("downloadRamlFiles", async () => {
  return search().then(apis => {
    return downloadRestApis(apis, config.inputDir)
      .then(folder => {
        generatorLogger.info(`Setting config.inputDir to '${folder}'`);
        config.inputDir = folder;
        return extractFiles(folder);
      })
      .then(async () => {
        const apiFamilyGroups = groupByCategory(
          removeRamlLinks(apis),
          config.apiFamily
        );
        fs.ensureDirSync(config.inputDir);
        return fs.writeFile(
          path.join(config.inputDir, config.apiConfigFile),
          JSON.stringify(apiFamilyGroups)
        );
      });
  });
});

gulp.task(
  "updateApis",
  gulp.series("backupApis", "downloadRamlFiles", "diffRamlFiles")
);
