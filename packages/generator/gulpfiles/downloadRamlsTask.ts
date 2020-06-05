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
import { diffNewAndArchivedRamlFiles } from "../src/gulpfileHelpers";
import { generatorLogger } from "../src/logger";

require("dotenv").config();

/**
 * Gets information about all the apis from exchange that match config.search,
 * for the version deployed in the config.exchangeDeploymentRegex environment.
 * If it fails to get information about the deployed version of an api, it
 * removes all the version specific information from `config.apiConfigFile`.
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

/**
 * Groups RAML files for the given key (API Family, a.k.a Bounded Context).
 * Once grouped, renderTemplates task creates one Client per group
 */
function downloadRamlFromExchange(): Promise<void> {
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
}

gulp.task("diffRamlFiles", async () => {
  const result = await diffNewAndArchivedRamlFiles(
    config.apiBackupDir,
    config.inputDir,
    path.join(config.apiBackupDir, config.apiConfigFile),
    path.join(config.inputDir, config.apiConfigFile)
  );
  return fs.writeFile(config.diffFile, JSON.stringify(result));
});

gulp.task("cleanup", async () => {
  fs.removeSync(path.join(config.apiBackupDir));
  fs.removeSync(config.diffFile);
  return fs.moveSync(
    path.join(config.inputDir),
    path.join(config.apiBackupDir)
  );
});

gulp.task("downloadRamlFiles", async () => {
  return downloadRamlFromExchange();
});

gulp.task(
  "updateApis",
  gulp.series("cleanup", "downloadRamlFiles", "diffRamlFiles")
);
