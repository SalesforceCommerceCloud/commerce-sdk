/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import * as log from "loglevel";
import path from "path";

const loggerPath = path.join(__dirname, "../src/logger.ts");

before(() => {
  chai.use(chaiAsPromised);
});

describe("Test default log level", () => {
  afterEach(() => {
    //delete the loaded module from cache
    delete require.cache[loggerPath];
  });
  it("Test default log level for generator", async () => {
    const logger = await import("../src/logger");
    return chai
      .expect(logger.generatorLogger.getLevel())
      .to.equal(log.levels.INFO);
  });
});

describe("Test log level set through environment variables", () => {
  afterEach(() => {
    delete require.cache[loggerPath];
  });
  it("Test with log level error as env variable", async () => {
    process.env.SDK_GENERATOR_LOG_LEVEL = "error";
    const logger = await import("../src/logger");
    return chai
      .expect(logger.generatorLogger.getLevel())
      .to.equal(log.levels.ERROR);
  });

  it("Test invalid log level set as env variable", async () => {
    process.env.SDK_GENERATOR_LOG_LEVEL = "invalid";
    return chai.expect(import("../src/logger")).to.be.eventually.rejected;
  });
});
