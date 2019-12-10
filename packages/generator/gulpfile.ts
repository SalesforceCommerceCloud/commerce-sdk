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
  getRamlByTag,
  getRamlFromDirectory
} from "@commerce-sdk/exchange-connector";
import tmp from "tmp";

require("dotenv").config();

import {
  WebApiBaseUnit,
  WebApiBaseUnitWithEncodesModel,
  WebApiBaseUnitWithDeclaresModel
} from "webapi-parser";

const RAML_API_FAMILIES = "raml-api-families.json";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require("./build-config.json");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
gulp.task("cleanTmp", (cb: any) => {
  log.info(`Removing ${config.tmpDir} directory`);
  return del([`${config.tmpDir}`], cb);
});

gulp.task("downloadRamlFromExchange", () => {
  const tmpDir = tmp.dirSync();

  return getBearer(
    process.env.ANYPOINT_USERNAME,
    process.env.ANYPOINT_PASSWORD
  ).then(token => {
    return getRamlByTag(token, process.env.ANYPOINT_TAG, tmpDir.name).then(
      () => {
        return extractFiles(tmpDir.name).then(() => {
          console.log(`Files downloaded to ${tmpDir.name}`);

          // TODO: This needs to be sorted by bounded context before being added to config.files
          config.files = getRamlFromDirectory(tmpDir.name);
        });
      }
    );
  });
});

gulp.task("groupRamls", async () => {
  await fs.ensureDir(`${config.tmpDir}`);
  // TODO: Replace this with downloaded RAML using downloadRamlFromExchange gulp task
  const ramlApiFamilies = _.groupBy(config.files, file => file.boundedContext);
  await fs.writeFile(
    path.join(`${config.tmpDir}`, RAML_API_FAMILIES),
    JSON.stringify(ramlApiFamilies)
  );
});

gulp.task(
  "renderTemplates",
  gulp.series(gulp.series("cleanTmp", "groupRamls"), async () => {
    // require the json written in groupRamls gulpTask
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const apiFamilyConfig = require(path.resolve(
      path.join(".", `${config.tmpDir}`, RAML_API_FAMILIES)
    ));
    const apiKeys = _.keysIn(apiFamilyConfig);
    for (const apiFamily of apiKeys) {
      const familyPromises = [];
      const ramlFileFromFamily = apiFamilyConfig[apiFamily];
      _.map(ramlFileFromFamily, ramlMeta => {
        familyPromises.push(processRamlFile(ramlMeta.ramlFile));
      });
      Promise.all(familyPromises).then(values => {
        fs.writeFileSync(
          `${config.tmpDir}/${apiFamily}.ts`,
          createClient(
            values.map(value => value as WebApiBaseUnitWithEncodesModel),
            apiFamily
          )
        );
        fs.writeFileSync(
          `${config.tmpDir}/${apiFamily}.types.ts`,
          createDto(
            values.map(
              value => (value as WebApiBaseUnitWithDeclaresModel).declares
            )
          )
        );
      });
    }
    fs.writeFileSync(`${config.tmpDir}/index.ts`, createIndex(apiKeys));
  })
);
