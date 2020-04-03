/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

import sinon from "sinon";

import { CacheManagerRedis } from "../src/base/cacheManagerRedis";

const expect = chai.expect;

before(() => {
  chai.should();
  chai.use(chaiAsPromised);
});

describe("update ttl tests", () => {
  let cacheManager;
  beforeEach(() => {
    cacheManager = new CacheManagerRedis();
    sinon.reset();
  });

  it("updates ttl on key", async () => {
    cacheManager.keyv = {
      opts: {
        store: { redis: { expire: async (key: string, ttl: number) => 1 } }
      }
    };
    return expect(
      cacheManager.updateTimeToLiveForKey("key", 100)
    ).to.eventually.equal(1);
  });
});

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
      opts: { store: { redis: { quit: async () => "other thing" } } }
    };
    return expect(cacheManager.quit()).to.eventually.be.false;
  });

  it("returns true when called with working redis", async () => {
    cacheManager.keyv = {
      opts: { store: { redis: { quit: async () => "OK" } } }
    };
    return expect(cacheManager.quit()).to.eventually.be.true;
  });
});
