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

describe("delete tests", () => {
  let cacheManager;

  before(() => {
    cacheManager = new CacheManagerKeyv();
    cacheManager.keyv = sinon.stub({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      delete: key => undefined
    });
  });

  beforeEach(() => {
    sinon.reset();
  });

  it("throws when called with a null request", async () => {
    return expect(cacheManager.delete(null)).to.eventually.be.rejectedWith(
      "Valid request object required to delete"
    );
  });

  it("throws when called with a bad url", async () => {
    return expect(cacheManager.delete(new fetch.Request("no-good"))).to
      .eventually.be.rejected;
  });

  it("returns false when not found", async () => {
    cacheManager.keyv.delete
      .onFirstCall()
      .returns(false)
      .onSecondCall()
      .returns(false);
    return expect(cacheManager.delete(new fetch.Request("https://example.com")))
      .to.eventually.be.false;
  });

  it("returns true when match found", async () => {
    cacheManager.keyv.delete
      .onFirstCall()
      .returns(true)
      .onSecondCall()
      .returns(true);
    return expect(cacheManager.delete(new fetch.Request("https://example.com")))
      .to.eventually.be.true;
  });

  it("returns true when only metadata match found", async () => {
    cacheManager.keyv.delete
      .onFirstCall()
      .returns(true)
      .onSecondCall()
      .returns(false);
    return expect(cacheManager.delete(new fetch.Request("https://example.com")))
      .to.eventually.be.true;
  });

  it("returns true when only content match found", async () => {
    cacheManager.keyv.delete
      .onFirstCall()
      .returns(false)
      .onSecondCall()
      .returns(true);
    return expect(cacheManager.delete(new fetch.Request("https://example.com")))
      .to.eventually.be.true;
  });
});
