/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

import fetch = require("minipass-fetch");

import sinon from "sinon";

import { CacheManagerKeyv } from "../src/base/cacheManagerKeyv";

const expect = chai.expect;

before(() => {
  chai.should();
  chai.use(chaiAsPromised);
});

describe("put tests", () => {
  let cacheManager;

  before(() => {
    cacheManager = new CacheManagerKeyv();
    cacheManager.keyv = sinon.stub({
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      get: key => { },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      set: (key, data) => { }
    });
  });

  beforeEach(() => {
    sinon.reset();
  });

  it("throws when called with a null request", async () => {
    return expect(cacheManager.put(null, null)).to.eventually.be.rejectedWith(
      "Cannot read property 'url' of null"
    );
  });

  it("throws when called with a bad url", async () => {
    return expect(
      cacheManager.put(
        new fetch.Request("no-good"),
        new fetch.Response(Buffer.from('{ "test": "body" }'), {})
      )
    ).to.eventually.be.rejected;
  });

  it("returns response after writing", async () => {
    const body = { test: "body" };
    const response = new fetch.Response(Buffer.from(JSON.stringify(body)), {});
    return expect(
      (
        await cacheManager.put(
          new fetch.Request("https://example.com"),
          response
        )
      ).json()
    ).to.eventually.deep.equal(body);
  });

  it("returns response after writing with query params", async () => {
    const url = "https://example.com?b=1&a=2";
    const body = { test: "body" };
    const response = new fetch.Response(Buffer.from(JSON.stringify(body)), {
      url: url
    });
    return expect(
      cacheManager.put(new fetch.Request(url), response)
    ).to.eventually.deep.include({ url: url });
  });

  it("returns response after writing for head request", async () => {
    const body = { test: "body" };
    const response = new fetch.Response(Buffer.from(JSON.stringify(body)), {});
    cacheManager.keyv.get
      .onFirstCall()
      .returns({ metadata: { url: "https://example.com" } });
    return expect(
      (
        await cacheManager.put(
          new fetch.Request("https://example.com", { method: "head" }),
          response
        )
      ).json()
    ).to.eventually.deep.equal(body);
  });

  it("returns response after writing for 304 response", async () => {
    const body = { test: "body" };
    const response = new fetch.Response(Buffer.from(JSON.stringify(body)), {
      status: 304
    });
    cacheManager.keyv.get
      .onFirstCall()
      .returns({ metadata: { url: "https://example.com" } });
    return expect(
      (
        await cacheManager.put(
          new fetch.Request("https://example.com"),
          response
        )
      ).json()
    ).to.eventually.deep.equal(body);
  });

  it("returns response with correct cache headers for head request", async () => {
    const body = { test: "body" };
    const response = new fetch.Response(Buffer.from(JSON.stringify(body)));
    const url = "https://example.com/";
    const cacheKey = encodeURIComponent(`request-cache:${url}`);
    const hash = "8743b52063cd84097a65d1633f5c74f5";
    const time = "1947-08-15";

    cacheManager.keyv.get.onFirstCall().returns({
      metadata: {
        url: "https://example.com/"
      },
      integrity: hash,
      time
    });
    const actualResponse = await cacheManager.put(
      new fetch.Request(url, { method: "head" }),
      response
    );

    expect(actualResponse.headers.get("X-Local-Cache")).to.equal("");
    expect(actualResponse.headers.get("X-Local-Cache-Key")).to.equal(cacheKey);
    expect(actualResponse.headers.get("X-Local-Cache-Hash")).to.equal(hash);
    expect(actualResponse.headers.get("X-Local-Cache-Time")).to.equal(
      new Date(time).toUTCString()
    );
  });
});
