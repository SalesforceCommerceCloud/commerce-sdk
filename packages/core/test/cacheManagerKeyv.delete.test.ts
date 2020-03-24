
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

describe("delete tests", () => {
  let cacheManager;

  before(() => {
    cacheManager = new CacheManagerKeyv();
    cacheManager.keyv = sinon.stub({
      delete: (key) => { }
    });
  });

  beforeEach(() => {
    sinon.reset();
  });

  it("throws when called with a null request", async () => {
    return expect(
        cacheManager.delete(null)
    ).to.eventually.be.rejectedWith("Cannot read property 'url' of null");
  });

  it("throws when called with a bad url", async () => {
    return expect(
      cacheManager.delete(new fetch.Request("no-good"))
    ).to.eventually.be.rejected;
  });

  it("returns false when not found", async () => {
    cacheManager.keyv.delete.onFirstCall().returns(false)
                            .onSecondCall().returns(false);
    return expect(
      cacheManager.delete(new fetch.Request("https://example.com"))
    ).to.eventually.be.false;
  });

  it("returns true when match found", async () => {
    cacheManager.keyv.delete.onFirstCall().returns(true)
                            .onSecondCall().returns(true);
    return expect(
      cacheManager.delete(new fetch.Request("https://example.com"))
    ).to.eventually.be.true;
  });

  it("returns true when only metadata match found", async () => {
    const cacheManager = new CacheManagerKeyv();
    cacheManager.keyv = sinon.stub({
        delete: (key) => { }
    });
    
    cacheManager.keyv.delete.onFirstCall().returns(true)
                            .onSecondCall().returns(false);
    return expect(
      cacheManager.delete(new fetch.Request("https://example.com"))
    ).to.eventually.be.true;
  });

  it("returns true when only content match found", async () => {
    const cacheManager = new CacheManagerKeyv();
    cacheManager.keyv = sinon.stub({
        delete: (key) => { }
    });
    
    cacheManager.keyv.delete.onFirstCall().returns(false)
                            .onSecondCall().returns(true);
    return expect(
      cacheManager.delete(new fetch.Request("https://example.com"))
    ).to.eventually.be.true;
  });
});