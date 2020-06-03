/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as gulp from "gulp";
import {
  processApiFamily,
  renderTemplates,
  renderOperationList
} from "../src/renderer";

import fs from "fs-extra";
import _ from "lodash";
import * as path from "path";

require("dotenv").config();

// eslint-disable-next-line @typescript-eslint/no-var-requires
import config from "../../../build-config";

/**
 *  Gulp task that renders typescript code for the APIs using the pre-defined templates
 */
gulp.task("renderTemplates", async () => {
  return renderTemplates(config);
});

gulp.task("buildOperationList", async () => {
  // require the json written in groupRamls gulpTask
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ramlGroupConfig = require(path.resolve(
    path.join(config.inputDir, config.apiConfigFile)
  ));
  const apiGroupKeys = _.keysIn(ramlGroupConfig);

  const allApis = {};

  const modelingPromises = [];

  for (const apiGroup of apiGroupKeys) {
    const familyPromise = processApiFamily(
      apiGroup,
      ramlGroupConfig,
      config.inputDir
    );
    fs.ensureDirSync(config.renderDir);

    modelingPromises.push(
      familyPromise.then(values => {
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
});
