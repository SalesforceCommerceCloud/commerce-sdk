
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
      get: (key) => { },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      set: (key, data) => { }
    });
  });

  beforeEach(() => {
    sinon.reset();
  });

  it("throws when called with a null request", async () => {
    return expect(
        cacheManager.put(null, null)
    ).to.eventually.be.rejectedWith("Cannot read property 'url' of null");
  });

  it("throws when called with a bad url", async () => {
    return expect(
      cacheManager.put(
        new fetch.Request("no-good"),
        new fetch.Response(Buffer.from("{ \"test\": \"body\" }"), {})
      )
    ).to.eventually.be.rejected;
  });

  it("returns response after writing", async () => {
    const body = { "test": "body" };
    const response = new fetch.Response(Buffer.from(JSON.stringify(body)), {});
    return expect(
      (await cacheManager.put(new fetch.Request("https://example.com"), response)).json()
    ).to.eventually.deep.equal(body);
  });
});