/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

import cacheTests from "../test/cache/basic.tests";
import etagTests from "../test/cache/etag.tests";
import evictionTests from "../test/cache/eviction.tests";
import multipleHeadersTests from "../test/cache/multipleHeaders.tests";
import noCacheHeaderTests from "../test/cache/noCacheHeader.tests";

import { BaseClient } from "../src/base/client";

describe("Redis cache tests", function() {
  before(function() {
    chai.should();
    chai.use(chaiAsPromised);
    this.client = new BaseClient({
      baseUri: "https://somewhere"
    });
  });
  beforeEach(function() {
    this.client.clientConfig.cacheManager?.keyv?.clear();
  });
  cacheTests();
});
