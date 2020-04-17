/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as gulp from "gulp";

import fs from "fs-extra";
import * as path from "path";

import {
  extractFiles,
  getBearer,
  searchExchange,
  downloadRestApis,
  RestApi,
  getVersionByDeployment,
  getSpecificApi,
  groupByCategory
} from "./src";
import { sdkLogger } from "../core";

require("dotenv").config();

import config from "../../build-config";
import { removeRamlLinks } from "./src/exchangeTools";

/**
 * Remove all the information that could be invalid so that the SDK is not
 * generated with incorrect information accidentally. Correct information
 * needs to be filled manually in 'apis/api-config.json' before the SDK can be
 * generated.
 *
 * @param api The API with incorrect information
 */
function removeInvalidInformation(api: RestApi) {
  api.id = null;
  api.updatedDate = null;
  api.version = null;
  api.fatRaml.createdDate = null;
  api.fatRaml.md5 = null;
  api.fatRaml.sha1 = null;
  if (api.fatRaml.externalLink) {
    delete api.fatRaml.externalLink;
  }
}

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
            removeInvalidInformation(api);
            return api;
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
        sdkLogger.warn(`Setting config.inputDir to '${folder}'`);
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

gulp.task("cleanInputDir", async () => {
  return fs.removeSync(path.join(config.inputDir));
});

gulp.task(
  "updateApis",
  gulp.series("cleanInputDir", async () => {
    return downloadRamlFromExchange();
  })
);
