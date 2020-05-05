/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as chai from "chai";
import * as log from "loglevel";
import { sdkLogger, COMMERCE_SDK_LOGGER_KEY } from "../src";

let logLevel;
before(() => {
  logLevel = sdkLogger.getLevel();
});
after(() => {
  //reset log level
  sdkLogger.setLevel(logLevel);
});

describe("Test log level", () => {
  it("Test default log level in sdkLogger", async () => {
    return chai.expect(sdkLogger.getLevel()).to.equal(log.levels.WARN);
  });
  it("Test default log level with getLogger function", async () => {
    return chai
      .expect(log.getLogger(COMMERCE_SDK_LOGGER_KEY).getLevel())
      .to.equal(log.levels.WARN);
  });
  it("Test log level change", async () => {
    sdkLogger.setLevel(sdkLogger.levels.DEBUG);
    return chai.expect(sdkLogger.getLevel()).to.equal(log.levels.DEBUG);
  });
});
