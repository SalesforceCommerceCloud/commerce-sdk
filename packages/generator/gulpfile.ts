/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as gulp from "gulp";
import { processApiFamily, groupByCategory } from "./src/parser";
import {
  renderTemplates,
  renderOperationList,
  createVersionFile
} from "./src/renderer";

import log from "fancy-log";
import del from "del";
import fs from "fs-extra";
import _ from "lodash";
import * as path from "path";

import {
  extractFiles,
  getBearer,
  searchExchange,
  downloadRestApis,
  RestApi,
  getVersionByDeployment,
  getSpecificApi
} from "@commerce-apps/exchange-connector";
import tmp from "tmp";

require("dotenv").config();

// eslint-disable-next-line @typescript-eslint/no-var-requires
import config from "./build-config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
gulp.task("clean", (cb: any) => {
  log.info(`Removing ${config.renderDir} directory`);
  return del([`${config.renderDir}`, "dist"], cb);
});

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
            api.version = null;
            return api;
          }
        }
      )
    );
  });
  return Promise.all(promises).then((deployedApis: RestApi[]) => {
    createVersionFile(deployedApis, config);
    return deployedApis;
  });
}

/**
 * Groups RAML files for the given key (API Family, a.k.a Bounded Context).
 * Once grouped, renderTemplates task creates one Client per group
 */
function downloadRamlFromExchange(): Promise<void> {
  const downloadDir = tmp.dirSync();
  return search().then(apis => {
    return downloadRestApis(apis, downloadDir.name)
      .then(folder => {
        console.log(`Setting config.inputDir to '${folder}'`);
        config.inputDir = folder;
        return extractFiles(folder);
      })
      .then(async () => {
        const apiFamilyGroups = groupByCategory(apis, config.apiFamily);
        fs.ensureDirSync(config.inputDir);
        return fs.writeFile(
          path.join(config.inputDir, config.apiConfigFile),
          JSON.stringify(apiFamilyGroups)
        );
      });
    // Group RAML files by the key, aka, bounded context/API Family
  });
}

gulp.task("downloadRamlFromExchange", async () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  if (process.env.EXCHANGE_DOWNLOAD) {
    console.log("Downloading apis from exchange");
    return downloadRamlFromExchange();
  } else {
    console.log("Not downloading so just using local files");
  }
});

/**
 *  Gulp task that renders typescript code for the APIs using the pre-defined templates
 */
gulp.task(
  "renderTemplates",
  gulp.series(gulp.series("clean", "downloadRamlFromExchange"), async () => {
    return renderTemplates(config);
  })
);

gulp.task(
  "buildOperationList",
  gulp.series(gulp.series("clean", "downloadRamlFromExchange"), async () => {
    // require the json written in groupRamls gulpTask
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ramlGroupConfig = require(path.resolve(
      path.join(config.inputDir, config.apiConfigFile)
    ));
    const apiGroupKeys = _.keysIn(ramlGroupConfig);

    const allApis = {};

    const modelingPromises = [];

    for (const apiGroup of apiGroupKeys) {
      const familyPromises = processApiFamily(
        apiGroup,
        ramlGroupConfig,
        config.inputDir
      );
      fs.ensureDirSync(config.renderDir);

      modelingPromises.push(
        Promise.all(familyPromises).then(values => {
          allApis[apiGroup] = values;
          return;
        })
      );
    }

    return Promise.all(modelingPromises).then(() => {
      fs.writeFileSync(
        path.join(config.renderDir, "operationList.yaml"),
        renderOperationList(allApis)
      );
    });
  })
);
