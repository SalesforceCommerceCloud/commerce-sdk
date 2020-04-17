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

const loggerPath = path.join(__dirname, "../src/base/sdkLogger.ts");

before(() => {
  chai.use(chaiAsPromised);
});

describe("Test default log level", () => {
  afterEach(() => {
    delete require.cache[loggerPath];
  });
  it("Test default log level for generator", async () => {
    const logger = await import("../src/base/sdkLogger");
    return chai.expect(logger.sdkLogger.getLevel()).to.equal(log.levels.WARN);
  });
});
