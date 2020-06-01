/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

import sinon from "sinon";
import Redis from "ioredis";

import { CacheManagerRedis } from "../src/base/cacheManagerRedis";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("quit tests", () => {
  let cacheManager;
  beforeEach(() => {
    cacheManager = new CacheManagerRedis();
    sinon.reset();
  });

  it("returns false when called with no keyv", async () => {
    return expect(cacheManager.quit()).to.eventually.be.false;
  });

  it("returns false when called with no opts", async () => {
    cacheManager.keyv = {};
    return expect(cacheManager.quit()).to.eventually.be.false;
  });

  it("returns false when called with no store", async () => {
    cacheManager.keyv = { opts: {} };
    return expect(cacheManager.quit()).to.eventually.be.false;
  });

  it("returns false when called with no redis", async () => {
    cacheManager.keyv = { opts: { store: {} } };
    return expect(cacheManager.quit()).to.eventually.be.false;
  });

  it("returns false when quit isn't OK", async () => {
    cacheManager.keyv = {
      opts: {
        store: { redis: { quit: async (): Promise<string> => "other thing" } }
      }
    };
    return expect(cacheManager.quit()).to.eventually.be.false;
  });

  it("returns true when called with working redis", async () => {
    cacheManager.keyv = {
      opts: { store: { redis: { quit: async (): Promise<string> => "OK" } } }
    };
    return expect(cacheManager.quit()).to.eventually.be.true;
  });
});

describe("Redis connections", () => {
  it("creates a Redis instance when correct config is passed", () => {
    const cacheManager = new CacheManagerRedis({
      connection: "redis://localhost"
    });
    expect(cacheManager.keyv.opts.store.redis).to.be.an.instanceOf(Redis);
    return cacheManager.quit();
  });
  it("creates a Redis cluster when correct config is passed", () => {
    const cacheManager = new CacheManagerRedis({
      clusterConfig: [{}]
    });
    expect(cacheManager.keyv.opts.store.redis).to.be.an.instanceOf(
      Redis.Cluster
    );
    return cacheManager.quit();
  });
});
