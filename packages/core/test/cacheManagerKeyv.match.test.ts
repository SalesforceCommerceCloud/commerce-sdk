
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

describe("match tests", () => {
  let cacheManager;

  before(() => {
    cacheManager = new CacheManagerKeyv();
    cacheManager.keyv = sinon.stub({
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      get: (key) => { }
    });
  });

  beforeEach(() => {
    sinon.reset();
  });

  it("throws when called with a null request", async () => {
    return expect(
        cacheManager.match(null)
    ).to.eventually.be.rejectedWith("Cannot read property 'url' of null");
  });

  it("throws when called with a bad url", async () => {
    return expect(
      cacheManager.match(new fetch.Request("no-good"))
    ).to.eventually.be.rejected;
  });

  it("returns undefined when not found", async () => {
    return expect(
      cacheManager.match(new fetch.Request("https://example.com"))
    ).to.eventually.be.undefined;
  });

  it("returns undefined when not exact match found", async () => {
    cacheManager.keyv.get.onFirstCall().returns({ "metadata": { "url": "https://test.com" }})
                         .onSecondCall().returns({ "key": "value" });
    return expect(
      cacheManager.match(new fetch.Request("https://example.com"))
    ).to.eventually.be.undefined;
  });

  it("returns response when exact match found", async () => {
    cacheManager.keyv.get.onFirstCall().returns({ "metadata": { "url": "https://example.com" }})
                         .onSecondCall().returns({ "key": "value" });
    return expect(
      (await cacheManager.match(new fetch.Request("https://example.com"))).json()
    ).to.eventually.deep.equal({ "key": "value" });
  });
});