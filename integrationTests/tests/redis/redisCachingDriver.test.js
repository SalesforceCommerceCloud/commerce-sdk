/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";

const { BaseClient, CacheManagerRedis } = require("@commerce-apps/core");
const cacheTests = require("../cache/basic.test.helper");
const etagTests = require("../cache/etag.test.helper");
const evictionTests = require("../cache/eviction.test.helper");
const multipleHeadersTests = require("../cache/multipleHeaders.test.helper");
const noCacheHeaderTests = require("../cache/noCacheHeader.test.helper");
const delayedTests = require("../cache/delayedTests.test.helper");

describe("Redis cache tests", function() {
  before(function() {
    this.client = new BaseClient({
      baseUri: "https://somewhere",
      cacheManager: new CacheManagerRedis({
        connection: "redis://localhost",
        keyvOptions: { keepAlive: false }
      })
    });
  });
  after(function() {
    this.client.clientConfig.cacheManager.quit();
  });
  cacheTests();
  etagTests();
  evictionTests();
  multipleHeadersTests();
  noCacheHeaderTests();
  delayedTests();
});
