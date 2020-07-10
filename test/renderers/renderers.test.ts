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
import _ from "lodash";
import { CLIEngine } from "eslint";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require("../../package.json");

describe("Renderers", () => {
  const CONFIG = {
    inputDir: path.join(__dirname, "../raml/valid"),
    renderDir: tmp.dirSync().name,
    apiFamily: "CC API Family",
    exchangeSearch: 'category:"CC Visibility" = "External"',
    apiConfigFile: "api-config.json",
    shopperAuthClient: "Customer.ShopperCustomers",
    shopperAuthApi: "authorizeCustomer",
    exchangeDeploymentRegex: /test/,
  };
  const expectFileToExist = (file: string): void => {
    const filePath = path.join(CONFIG.renderDir, file);
    const exists = fs.pathExistsSync(filePath);
    expect(exists, `File not found: ${file}`).to.be.true;
  };

  describe("renderTemplates", async () => {
    let eslintConfig;
    before("Rendering", async () => renderer.renderTemplates(CONFIG));
    before("Linter Setup", () => {
      eslintConfig = _.cloneDeep(pkg.eslintConfig);
      const override = eslintConfig.overrides?.find((or) => {
        return or.files.includes("dist/**");
      });
      if (!override) {
        throw new Error(
          "No eslint overrides found for the generated files. Do the tests need to be updated?"
        );
      }
      _.merge(eslintConfig.rules, override.rules);
    });

    it("generates TypeScript files", () => {
      expectFileToExist("index.ts");
      expectFileToExist("helpers.ts");
      expectFileToExist("shop/shopApi/shopApi.ts");
      expectFileToExist("shop/shopApi/shopApi.types.ts");
      expectFileToExist("customer/shopperCustomers/shopperCustomers.ts");
      expectFileToExist("customer/shopperCustomers/shopperCustomers.types.ts");
    }).timeout(10000);

    it("generates valid TypeScript", () => {
      // The build script for the SDK runs `eslint --quiet --fix`. This only
      // reports fatal errors. There is no equivalent option for `quiet` in the
      // CLIEngine, so we must manually check linting results for fatal errors.
      // See: https://eslint.org/docs/developer-guide/nodejs-api#cliengine
      // (Docs may be inaccurate as we're currently on an older version.)
      const cli = new CLIEngine({
        baseConfig: eslintConfig,
        extensions: [".ts"],
        fix: true,
        useEslintrc: false,
      });
      function expectValidTypeScript(file: string): void {
        const linted = cli.executeOnFiles([path.join(CONFIG.renderDir, file)]);
        const fatal = linted.results.some((result) => {
          return result.messages.some((msg) => msg.fatal);
        });
        expect(fatal, `Fatal linting errors in ${file}`).to.be.false;
      }

      expectValidTypeScript("index.ts");
      expectValidTypeScript("helpers.ts");
      expectValidTypeScript("shop/shopApi/shopApi.ts");
      expectValidTypeScript("shop/shopApi/shopApi.types.ts");
      expectValidTypeScript("customer/shopperCustomers/shopperCustomers.ts");
      expectValidTypeScript(
        "customer/shopperCustomers/shopperCustomers.types.ts"
      );
    }).timeout(10000);
  });
});
