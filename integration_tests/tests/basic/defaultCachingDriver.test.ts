/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";
import cacheTests from "../cache/basic.tests";
import { BaseClient } from "@commerce-apps/core";
import etagTests from "../cache/etag.tests";
import evictionTests from "../cache/eviction.tests";
import multipleHeadersTests from "../cache/multipleHeaders.tests";
import noCacheHeaderTests from "../cache/noCacheHeader.tests";
import delayedTests from "../cache/delayedTests.tests";

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
