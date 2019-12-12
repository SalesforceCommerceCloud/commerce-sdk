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
  getRamlFromDirectory,
  getConfigFilesFromDirectory
} from "@commerce-sdk/exchange-connector";
import tmp from "tmp";

require("dotenv").config();

import {
  WebApiBaseUnit,
  WebApiBaseUnitWithEncodesModel,
  WebApiBaseUnitWithDeclaresModel
} from "webapi-parser";

const RAML_GROUPS = "raml-groups.json";

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

/**
 * Prepares sdk-integretion-test.zip file for integration testing
 * The zip file will be moved to a temporary folder, extracted, parsed and grouped, built and then
 * integration tests will be executed. This is necessary to ensuree the downloaded fat ramls follow
 * similar route before generating the respective SDKs.
 */
gulp.task("prepareIntegrationTest", async () => {
  await fs.ensureDir(`${config.tmpDir}`);
  const tmpDir = tmp.dirSync();
  console.log("tmpDir", tmpDir);

  //This copy mocks the download of fat raml files
  //TODO replace this with download raml task, use gulp dependency
  fs.copyFileSync(
    path.join(path.resolve("test"), "raml", "valid", "sdk-integration.zip"),
    path.join(tmpDir.name, "sdk-integration.zip")
  );
  fs.copyFileSync(
    path.resolve("build-config.json"),
    path.join(`${config.tmpDir}`, "pre-group-build-config.json")
  );
  // require the temporary json and replace the files property after extraction
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const preGroupConfig = require(path.resolve(
    path.join(`${config.tmpDir}`, "pre-group-build-config.json")
  ));

  return extractFiles(tmpDir.name).then(() => {
    console.log(`Files extracted for integration test to ${tmpDir.name}`);
    const configFiles = getConfigFilesFromDirectory(tmpDir.name);
    console.log("configFiles", configFiles);
    preGroupConfig.files = configFiles;
    console.log("groupedConfig.files", JSON.stringify(preGroupConfig));
  });
});

/**
 * Groups RAML files for the given key (API Family, a.k.a Bounded Context).
 * Once grouped, renderTemplates task creates one Client per group
 */
gulp.task(
  "groupRamls",
  gulp.series("prepareIntegrationTest", async () => {
    // require the temporary json and replace the files property after extraction
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const preGroupConfig = require(path.resolve(
      path.join(`${config.tmpDir}`, "pre-group-build-config.json")
    ));

    // TODO: Replace this with downloaded RAML using downloadRamlFromExchange gulp task
    const ramlGroups = _.groupBy(
      preGroupConfig.files,
      file => file.boundedContext
    );
    await fs.writeFile(
      path.join(`${config.tmpDir}`, RAML_GROUPS),
      JSON.stringify(ramlGroups)
    );
  })
);

gulp.task(
  "renderTemplates",
  gulp.series(gulp.series("cleanTmp", "groupRamls"), async () => {
    // require the json written in groupRamls gulpTask
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ramlGroupConfig = require(path.resolve(
      path.join(`${config.tmpDir}`, RAML_GROUPS)
    ));
    const apiGroupKeys = _.keysIn(ramlGroupConfig);
    for (const apiGroup of apiGroupKeys) {
      const familyPromises = [];
      const ramlFileFromFamily = ramlGroupConfig[apiGroup];
      _.map(ramlFileFromFamily, ramlMeta => {
        familyPromises.push(processRamlFile(ramlMeta.ramlFile));
      });
      Promise.all(familyPromises).then(values => {
        fs.writeFileSync(
          `${config.tmpDir}/${apiGroup}.ts`,
          createClient(
            values.map(value => value as WebApiBaseUnitWithEncodesModel),
            apiGroup
          )
        );
        fs.writeFileSync(
          `${config.tmpDir}/${apiGroup}.types.ts`,
          createDto(
            values.map(
              value => (value as WebApiBaseUnitWithDeclaresModel).declares
            )
          )
        );
      });
    }
    fs.writeFileSync(`${config.tmpDir}/index.ts`, createIndex(apiGroupKeys));
  })
);
