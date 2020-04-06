/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

import fetch from "minipass-fetch";

import sinon from "sinon";

import { CacheManagerKeyv } from "../src/base/cacheManagerKeyv";

const expect = chai.expect;

before(() => {
  chai.should();
  chai.use(chaiAsPromised);
});

describe("put tests", () => {
  let cacheManager;
  let bodyBuffer;
  let testRequest;
  let testResponse;
  const url = "https://example.com";

  before(() => {
    cacheManager = new CacheManagerKeyv();
    cacheManager.keyv = sinon.stub({
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      get: key => {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      set: (key, data, expires) => {}
    });
  });

  beforeEach(() => {
    sinon.reset();
    testRequest = new fetch.Request(url);
    bodyBuffer = Buffer.from(JSON.stringify({ test: "body" }));
    testResponse = new fetch.Response(bodyBuffer, { url: url });
  });

  it("sets ttl to 0 when cache-control private", async () => {
    testResponse.headers.set("Cache-Control", "private");
    await cacheManager.put(testRequest, testResponse);
    sinon.assert.notCalled(cacheManager.keyv.set);
  });

  it("sets ttl to 0 when cache-control is no-store", async () => {
    testResponse.headers.set("Cache-Control", "no-store");
    await cacheManager.put(testRequest, testResponse);
    sinon.assert.notCalled(cacheManager.keyv.set);
  });

  it("sets ttl to 0 when cache-control is s-maxage is 0", async () => {
    testResponse.headers.set("Cache-Control", "s-maxage=0");
    await cacheManager.put(testRequest, testResponse);
    sinon.assert.notCalled(cacheManager.keyv.set);
  });

  it("sets ttl to 600 when cache-control is s-maxage is 600", async () => {
    testResponse.headers.set("Cache-Control", "s-maxage=600");
    await cacheManager.put(testRequest, testResponse);
    sinon.assert.calledWith(
      cacheManager.keyv.set,
      sinon.match.string,
      sinon.match.any,
      600000
    );
  });

  it("sets ttl to 0 when cache-control is max-age is 0", async () => {
    testResponse.headers.set("Cache-Control", "max-age=0");
    await cacheManager.put(testRequest, testResponse);
    sinon.assert.notCalled(cacheManager.keyv.set);
  });

  it("sets ttl to 600 when cache-control is max-age is 600", async () => {
    testResponse.headers.set("Cache-Control", "max-age=600");
    await cacheManager.put(testRequest, testResponse);
    sinon.assert.calledWith(
      cacheManager.keyv.set,
      sinon.match.string,
      sinon.match.any,
      600000
    );
  });

  it("sets ttl to 0 when expires is in the past", async () => {
    testResponse.headers.set("Expires", "Sat, 13 May 2017 07:00:00 GMT");
    await cacheManager.put(testRequest, testResponse);
    sinon.assert.notCalled(cacheManager.keyv.set);
  });

  it("sets ttl to something when expires is tomorrow", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    testResponse.headers.set("Expires", tomorrow);
    await cacheManager.put(testRequest, testResponse);
    sinon.assert.calledWith(
      cacheManager.keyv.set,
      sinon.match.string,
      sinon.match.any,
      sinon.match.number
    );
  });
});
