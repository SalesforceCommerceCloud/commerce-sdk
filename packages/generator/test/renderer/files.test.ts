/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as renderer from "../../src/renderer";
import { expect } from "chai";
import path from "path";
import tmp from "tmp";
import fs from "fs-extra";

describe("Renderers", () => {
  const DEFAULT_CONFIG = {
    inputDir: path.join(__dirname, "../raml/valid"),
    renderDir: tmp.dirSync().name,
    apiFamily: "CC API Family",
    exchangeSearch: 'category:"CC Visibility" = "External"',
    apiConfigFile: "api-config.json",
    shopperAuthClient: "Customer.ShopperCustomers",
    shopperAuthApi: "authorizeCustomer",
    exchangeDeploymentRegex: /test/
  };
  const expectFileToExist = (file: string): void => {
    const filePath = path.join(DEFAULT_CONFIG.renderDir, file);
    const exists = fs.pathExistsSync(filePath);
    expect(exists, `File not found: ${file}`).to.be.true;
  };

  describe("renderTemplates", async () => {
    before(async () => renderer.renderTemplates(DEFAULT_CONFIG));
    it("generates TypeScript files", () => {
      expectFileToExist("index.ts");
      expectFileToExist("helpers.ts");
      expectFileToExist("shop/shopApi/shopApi.ts");
      expectFileToExist("shop/shopApi/shopApi.types.ts");
      expectFileToExist("customer/shopperCustomers/shopperCustomers.ts");
      expectFileToExist("customer/shopperCustomers/shopperCustomers.types.ts");
    });
  });

  describe("renderDocumentation", () => {
    // This renderer creates the file outside the directory specified by the
    // config, so in order to stay within our tmp dir, we have to specify a
    // subdirectory, even though it's not used.
    const renderDir = path.join(DEFAULT_CONFIG.renderDir, "subdirectory");
    const config = Object.assign({}, DEFAULT_CONFIG, { renderDir });
    before(async () => renderer.renderDocumentation(config));
    it("generates documentation files", () => {
      expectFileToExist("APICLIENTS.md");
    });
  });

  describe("renderOperationsList", () => {
    before(async () => renderer.renderOperationList(DEFAULT_CONFIG));
    it("generates operations file", () => {
      expectFileToExist("operationList.yaml");
    });
  });
});
