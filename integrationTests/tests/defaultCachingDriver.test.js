/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";

const { BaseClient } = require("@commerce-apps/core");
const cacheTests = require("./cacheHelpers/basic.test.helper");
const etagTests = require("./cacheHelpers/etag.test.helper");
const evictionTests = require("./cacheHelpers/eviction.test.helper");
const multipleHeadersTests = require("./cacheHelpers/multipleHeaders.test.helper");
const noCacheHeaderTests = require("./cacheHelpers/noCacheHeader.test.helper");
const delayedTests = require("./cacheHelpers/delayedTests.test.helper");

describe("Default cache tests", function() {
  before(function() {
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
