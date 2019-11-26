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

// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require("./build-config.json");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
gulp.task("cleanTmp", (cb: any) => {
  log.info(`Removing ${config.tmpDir} directory`);
  return del([`${config.tmpDir}`], cb);
});

gulp.task("retrieveTemplates", () => {
  const tmpDir = tmp.dirSync();

  return getBearer(
    process.env.ANYPOINT_USERNAME,
    process.env.ANYPOINT_PASSWORD
  ).then(token => {
    return getRamlByTag(token, process.env.ANYPOINT_TAG, tmpDir.name).then(
      () => {
        return extractFiles(tmpDir.name).then(() => {
          console.log(`Files downloaded to ${tmpDir.name}`);
          config.files = getRamlFromDirectory(tmpDir.name);
        });
      }
    );
  });
});

gulp.task(
  "renderTemplates",
  gulp.series("cleanTmp", async () => {
    await fs.ensureDir(`${config.tmpDir}`);

    // console.log(config);
    // TODO: This needs to be replaced with calls to download the raml instead of reading it locally.
    // When this is done we should move it out of this file and into the library with tests.
    for (const entry of config.files) {
      await processRamlFile(entry.ramlFile)
        .then((res: WebApiBaseUnit) => {
          fs.writeFileSync(
            `${config.tmpDir}/${entry.boundedContext}.ts`,
            createClient(
              res as WebApiBaseUnitWithEncodesModel,
              entry.boundedContext
            )
          );
          fs.writeFileSync(
            `${config.tmpDir}/${entry.boundedContext}.types.ts`,
            createDto((res as WebApiBaseUnitWithDeclaresModel).declares)
          );
        })
        .catch(err => {
          console.log(err);
        });
    }

    fs.writeFileSync(`${config.tmpDir}/index.ts`, createIndex(config.files));
  })
);
