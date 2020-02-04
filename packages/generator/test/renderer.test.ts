/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";

import fs from "fs-extra";
import { expect } from "chai";
import path from "path";
import * as renderer from "../src/renderer";
import tmp from "tmp";
import _ from "lodash";

/**
 * Tests all the functions that are invoked while rendering templates.
 *
 * Note: Ideally we want a independent test for each function. As of today (01/30/2020) this is not possible with Sinon when the functions are in the same module.
 * Sinon works by overwriting a reference to a function on an object, making it point at something else. It can't replace references to the same function in other contexts.
 *
 * Example: We can't mock renderApiFamily function while testing renderTemplates function. To make it work renderTemplates should invoke
 * renderApiFamily as "module.exports.renderApiFamily(..)" which is not desired.
 */
describe("Render Templates Test", () => {
  it("Render Templates", () => {
    const renderDir = tmp.dirSync();
    const apiInputDir = path.join(__dirname, "/raml/valid");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const apiConfig = require(path.join(
      __dirname,
      "/raml/valid/api-config.json"
    ));
    return renderer
      .renderTemplates(renderDir.name, apiInputDir, "api-config.json")
      .then(() => {
        expect(fs.existsSync(path.join(renderDir.name, "index.ts"))).to.be.true;
        const apiFamilies: string[] = _.keysIn(apiConfig);
        apiFamilies.forEach(family => {
          expect(
            fs.existsSync(path.join(renderDir.name, family, family + ".ts"))
          ).to.be.true;
          const familyAps: any[] = apiConfig[family];
          familyAps.forEach(api => {
            const apiName = _.upperFirst(_.camelCase(api.name));
            fs.existsSync(
              path.join(renderDir.name, family, apiName, apiName + ".ts")
            );
            fs.existsSync(
              path.join(renderDir.name, family, apiName, apiName + "types.ts")
            );
          });
        });
      });
  }).timeout(10000);
});
