/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { BaseClient } = require("@commerce-apps/core");
const cacheTests = require("../cache/basic.tests");
const etagTests = require("../cache/etag.tests");
const evictionTests = require("../cache/eviction.tests");
const multipleHeadersTests = require("../cache/multipleHeaders.tests");
const noCacheHeaderTests = require("../cache/noCacheHeader.tests");
const delayedTests = require("../cache/delayedTests.tests");

describe("Default cache tests", function() {
  before(function() {
    chai.should();
    chai.use(chaiAsPromised);
    this.client = new BaseClient({
      baseUri: "https://somewhere"
    });
  });
  cacheTests();
  etagTests();
  evictionTests();
  multipleHeadersTests();
  noCacheHeaderTests();
  delayedTests();
});
