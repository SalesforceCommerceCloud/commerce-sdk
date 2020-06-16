/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";

import fs from "fs-extra";
import chai, { assert, expect } from "chai";
import path from "path";
import * as renderer from "../src/renderer";
import tmp from "tmp";
import _ from "lodash";
import { getNormalizedName, model, RestApi } from "@commerce-apps/raml-toolkit";

/**
 * Tests all the functions that are invoked while rendering templates.
 *
 * Note: Ideally we want a independent test for each function. As of today (01/30/2020) this is not possible with Sinon when the functions are in the same module.
 * Sinon works by overwriting a reference to a function on an object, making it point at something else. It can't replace references to the same function in other contexts.
 *
 * Example: We can't mock renderApiFamily function while testing renderTemplates function. To make it work renderTemplates should invoke
 * renderApiFamily as "module.exports.renderApiFamily(..)" which is not desired.
 */
describe("Rendering Tests", () => {
  const mainDir = tmp.dirSync();
  const renderDirPath: string = path.join(mainDir.name, "renderedTemplates");
  fs.ensureDirSync(renderDirPath);

  const apiInputDir = path.join(__dirname, "/raml/valid");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const apiConfig = require(path.join(
    __dirname,
    "/raml/valid/api-config.json"
  ));

  it("Templates are rendered", () => {
    return renderer
      .renderTemplates({
        inputDir: apiInputDir,
        renderDir: renderDirPath,
        apiFamily: "CC API Family",
        exchangeSearch: 'category:"CC Visibility" = "External"',
        apiConfigFile: "api-config.json",
        shopperAuthClient: "Customer.ShopperCustomers",
        shopperAuthApi: "authorizeCustomer"
      })
      .then(() => {
        expect(fs.existsSync(path.join(renderDirPath, "index.ts"))).to.be.true;
        const apiFamilies: string[] = _.keysIn(apiConfig);
        apiFamilies.forEach(family => {
          const apiFamilyNormalizedName: string = getNormalizedName(family);
          expect(
            fs.existsSync(
              path.join(
                renderDirPath,
                apiFamilyNormalizedName,
                apiFamilyNormalizedName + ".ts"
              )
            )
          ).to.be.true;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const familyAps: any[] = apiConfig[family];
          familyAps.forEach(api => {
            const apiName = getNormalizedName(api.name);
            expect(
              fs.existsSync(
                path.join(
                  renderDirPath,
                  apiFamilyNormalizedName,
                  apiName,
                  apiName + ".ts"
                )
              )
            ).to.be.true;
            expect(
              fs.existsSync(
                path.join(
                  renderDirPath,
                  apiFamilyNormalizedName,
                  apiName,
                  apiName + ".types.ts"
                )
              )
            ).to.be.true;
            // TODO: Needs to be moved to when we update the API's from updateApis.
            // expect(fs.existsSync(path.join(mainDir.name, "APICLIENTS.md"))).to
            //   .be.true;
          });
        });
      });
  }).timeout(10000);

  it("Operation list is rendered as valid YAML", async () => {
    const allApis = {};
    await Promise.all(
      _.keysIn(apiConfig).map(async apiGroup => {
        allApis[apiGroup] = await Promise.all(
          renderer.processApiFamily(apiGroup, apiConfig, apiInputDir)
        );
      })
    );
    const list = renderer.renderOperationList(allApis);
    expect(list).to.be.a("string");
  });

  it("Throws error when id is missing", () => {
    expect(() =>
      renderer.processApiFamily("test", { test: { id: "" } }, "")
    ).to.throw();
  });
});

const validateApisOrder = function(apis: renderer.ApiClientsInfoT): void {
  expect(apis[0].config.name).to.equal("A");
  expect(apis[1].config.name).to.equal("B");
  expect(apis[2].config.name).to.equal("C");
};

describe("Test sorting of APIs", () => {
  it("Test that APIs are sorted", () => {
    const api1: RestApi = {
      name: "B",
      id: "B",
      groupId: "B",
      assetId: "assignments"
    };
    const api2: RestApi = {
      name: "A",
      id: "A",
      groupId: "A",
      assetId: "assignments"
    };
    const api3: RestApi = {
      name: "C",
      id: "C",
      groupId: "C",
      assetId: "assignments"
    };
    const m = {} as model.domain.WebApi;
    const apiFamilies: renderer.ApiClientsInfoT[] = [
      [
        { family: "Shopper", model: m, config: api1 },
        { family: "Shopper", model: m, config: api2 },
        { family: "Shopper", model: m, config: api3 }
      ],
      [
        { family: "AI", model: m, config: api3 },
        { family: "AI", model: m, config: api2 },
        { family: "AI", model: m, config: api1 }
      ]
    ];
    renderer.sortApis(apiFamilies);
    expect(apiFamilies[0][0].family).to.equal("AI");
    expect(apiFamilies[1][0].family).to.equal("Shopper");
    validateApisOrder(apiFamilies[0]);
    validateApisOrder(apiFamilies[1]);
  });
});
