/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";
import { expect } from "chai";
import { CacheManagerKeyv } from "../src/base/cacheManagerKeyv";
import Redis from "ioredis";

describe("CacheManagerKeyv constructor", () => {
  it("uses the default keyv store when no options passed", () => {
    const cacheManager = new CacheManagerKeyv();
    expect(cacheManager.keyv.opts.store).to.be.an.instanceOf(Map);
  });

  it("accepts a custom keyv store", () => {
    const keyvStore = new Map();
    const cacheManager = new CacheManagerKeyv({ keyvStore });
    expect(cacheManager.keyv.opts.store).to.equal(keyvStore);
  });

  it("accepts a database connection string to create the keyv store", () => {
    const cacheManager = new CacheManagerKeyv({
      connection: "redis://localhost"
    });
    const { redis } = cacheManager.keyv.opts.store;
    redis.quit();
    expect(redis).to.be.an.instanceOf(Redis);
  });

  it("accepts keyv options to be passed through", () => {
    const cacheManager = new CacheManagerKeyv({
      keyvOptions: { namespace: "test" }
    });
    expect(cacheManager.keyv.opts.namespace).to.equal("test");
  });
});
