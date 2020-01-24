/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as gulp from "gulp";
import { processRamlFile } from "./src/parser";
import {
  createClient,
  createDto,
  createApiIndex,
  createApiGroup,
  createIndex
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
  RestApi
} from "@commerce-apps/exchange-connector";
import tmp from "tmp";

require("dotenv").config();

import { WebApiBaseUnitWithEncodesModel } from "webapi-parser";
import { model } from "amf-client-js";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require("./build-config.json");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
gulp.task("clean", (cb: any) => {
  log.info(`Removing ${config.renderDir} directory`);
  return del([`${config.renderDir}`, "dist"], cb);
});

function search(): Promise<RestApi[]> {
  return getBearer(
    process.env.ANYPOINT_USERNAME,
    process.env.ANYPOINT_PASSWORD
  ).then(token => {
    return searchExchange(token, config.exchangeSearch);
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
        const ramlGroups = _.groupBy(apis, api => {
          // Categories are actually a list.
          // We are just going to use whatever the first one is for now
          return api.categories[config.apiFamily][0];
        });
        fs.ensureDirSync(config.inputDir);
        return fs.writeFile(
          path.join(config.inputDir, config.apiConfigFile),
          JSON.stringify(ramlGroups)
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
function getApiName(apiModel: WebApiBaseUnitWithEncodesModel): string {
  const apiName: string = (apiModel.encodes as model.domain.WebApi).name.value();
  return _.upperFirst(_.camelCase(apiName));
}

gulp.task(
  "renderTemplates",
  gulp.series(gulp.series("clean", "downloadRamlFromExchange"), async () => {
    // require the json written in groupRamls gulpTask
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ramlGroupConfig = require(path.resolve(
      path.join(config.inputDir, config.apiConfigFile)
    ));
    const apiGroupKeys = _.keysIn(ramlGroupConfig);

    for (const apiGroup of apiGroupKeys) {
      const familyPromises = [];
      const ramlFileFromFamily = ramlGroupConfig[apiGroup];
      _.map(ramlFileFromFamily, (apiMeta: RestApi) => {
        familyPromises.push(
          processRamlFile(
            path.join(
              config.inputDir,
              apiMeta.assetId,
              apiMeta.fatRaml.mainFile
            )
          )
        );
      });
      const apiGroupPath: string = path.join(config.renderDir, apiGroup);
      fs.ensureDirSync(apiGroupPath);

      Promise.all(familyPromises)
        .then(values => {
          const apiNames = [];
          values.forEach(api => {
            const apiName: string = getApiName(api);
            apiNames.push(apiName);
            const apiPath: string = path.join(apiGroupPath, apiName);
            fs.ensureDirSync(apiPath);
            const temp: WebApiBaseUnitWithEncodesModel[] = [api];
            fs.writeFileSync(
              path.join(apiPath, `${apiName}.ts`),
              createClient(temp, apiName)
            );
            fs.writeFileSync(
              path.join(apiPath, `${apiName}.types.ts`),
              createDto(temp)
            );
            fs.writeFileSync(
              path.join(apiPath, "index.ts"),
              createApiIndex([apiName])
            );
          });
          return apiNames;
        })
        .then(apiNames => {
          fs.writeFileSync(
            path.join(apiGroupPath, `${apiGroup}.ts`),
            createApiGroup(apiNames)
          );
        });
    }
    fs.writeFileSync(
      path.join(config.renderDir, "index.ts"),
      createIndex(apiGroupKeys)
    );
  })
);
