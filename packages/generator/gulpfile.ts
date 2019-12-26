/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as gulp from "gulp";
import { processRamlFile } from "./src/parser";
import { createClient, createDto, createIndex } from "./src/renderer";
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
} from "@commerce-sdk/exchange-connector";
import tmp from "tmp";

require("dotenv").config();

import { WebApiBaseUnitWithEncodesModel } from "webapi-parser";

const RAML_GROUPS = "raml-groups.json";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require("./build-config.json");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
gulp.task("cleanTmp", (cb: any) => {
  log.info(`Removing ${config.renderDir} directory`);
  return;
  // return del([`${config.renderDir}`], cb);
});

function search(): Promise<RestApi[]> {
  return getBearer(
    process.env.ANYPOINT_USERNAME,
    process.env.ANYPOINT_PASSWORD
  ).then(token => {
    return searchExchange(token, 'category:"CC API Family"');
  });
}

gulp.task("downloadRamlFromExchange", search);

/**
 * Groups RAML files for the given key (API Family, a.k.a Bounded Context).
 * Once grouped, renderTemplates task creates one Client per group
 */
function groupRamls(): Promise<void> {
  return search().then(apis => {
    return downloadRestApis(apis)
      .then(folder => {
        config.inputDir = folder;
        return extractFiles(folder);
      })
      .then(async () => {
        const ramlGroups = _.groupBy(apis, api => {
          return api.categories["CC API Family"][0];
        });
        fs.ensureDirSync(config.inputDir);
        return fs.writeFile(
          path.join(`${config.inputDir}`, RAML_GROUPS),
          JSON.stringify(ramlGroups)
        );
      });

    // Group RAML files by the key, aka, bounded context/API Family
  });
}

gulp.task("groupRamls", async () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  if (process.env.DOWNLOAD) {
    return groupRamls();
  }
});

gulp.task(
  "renderTemplates",
  gulp.series(gulp.series("groupRamls"), async () => {
    // require the json written in groupRamls gulpTask
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ramlGroupConfig = require(path.resolve(
      path.join(`${config.inputDir}`, RAML_GROUPS)
    ));
    // console.log(ramlGroupConfig);
    const apiGroupKeys = _.keysIn(ramlGroupConfig);

    for (const apiGroup of apiGroupKeys) {
      const familyPromises = [];
      const ramlFileFromFamily = ramlGroupConfig[apiGroup];
      _.map(ramlFileFromFamily, (apiMeta: RestApi) => {
        familyPromises.push(
          processRamlFile(
            `${config.inputDir}/${apiMeta.assetId}/${apiMeta.fatRaml.mainFile}`
          )
        );
      });
      fs.ensureDirSync(config.renderDir);
      Promise.all(familyPromises)
        .then(values => {
          // console.log(values);
          fs.writeFileSync(
            `${config.renderDir}/${apiGroup}.ts`,
            createClient(
              values.map(value => value as WebApiBaseUnitWithEncodesModel),
              apiGroup
            )
          );
          fs.writeFileSync(
            `${config.renderDir}/${apiGroup}.types.ts`,
            createDto(
              values.map(value => value as WebApiBaseUnitWithEncodesModel)
            )
          );
        })
        .catch(err => {
          console.log(err);
        });
    }
    fs.writeFileSync(`${config.renderDir}/index.ts`, createIndex(apiGroupKeys));
  })
);
