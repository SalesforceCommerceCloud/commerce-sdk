"use strict";

const fetchMock = require("fetch-mock").sandbox();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodeFetch = require("node-fetch");
nodeFetch.default = fetchMock;

import chai from "chai";
import chaiAsPromised from "chai-as-promised";

const assert = chai.assert;
const expect = chai.expect;

before(() => {
  chai.should();
  chai.use(chaiAsPromised);
});

import { BaseClient, ResponseError } from "../../src/core/base/client";

describe("base client get test", () => {
  it("makes correct call", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });

    fetchMock.get("*", { status: 200, body: { mock: "data" } });

    return client
      .get("/over/the/rainbow")
      .then(data => {
        expect(data).to.eql({ mock: "data" });
        expect(fetchMock.lastUrl()).to.equal(
          "https://somewhere/over/the/rainbow"
        );
      })
      .finally(() => {
        fetchMock.restore();
      });
  });
});

describe("base client delete test", () => {
  let client;

  beforeEach(() => {
    client = new BaseClient({ baseUri: "https://somewhere" });
  });
  afterEach(fetchMock.restore);

  it("deletes resource and returns 200", () => {
    fetchMock.delete("*", 200);

    return client.delete("/over/the/rainbow").then(() => {
      expect(fetchMock.lastUrl()).to.equal(
        "https://somewhere/over/the/rainbow"
      );
    });
  });

  it("is not ok when attempting to delete nonexistent resource", () => {
    fetchMock.delete("*", 404);

    return client
      .delete("/over/the/rainbow")
      .should.eventually.be.rejectedWith(ResponseError);
  });

  it("deletes resource with id and returns 200", () => {
    fetchMock.delete("*", 200);

    return client.delete("/over/the/{id}", { id: "rainbow" }).then(() => {
      expect(fetchMock.lastUrl()).to.equal(
        "https://somewhere/over/the/rainbow"
      );
    });
  });

  it("deletes resource with id in query param and returns 200", () => {
    fetchMock.delete("*", 200);

    return client.delete("/over/the/", {}, { id: "rainbow" }).then(() => {
      expect(fetchMock.lastUrl()).to.equal(
        "https://somewhere/over/the/?id=rainbow"
      );
    });
  });
});

describe("base client post test", () => {
  let client;

  beforeEach(() => {
    client = new BaseClient({ baseUri: "https://somewhere" });
  });
  afterEach(fetchMock.restore);

  it("post resource and returns 201", () => {
    fetchMock.post("*", 201);

    return client.post("/over/the/rainbow", {}, {}, {}).then(() => {
      expect(fetchMock.lastUrl()).to.equal(
        "https://somewhere/over/the/rainbow"
      );
    });
  });

  it("is not ok when attempting to post nonexistent collection", () => {
    fetchMock.post("*", 404);

    return client
      .post("/over/the/rainbow", {}, {}, {})
      .should.eventually.be.rejectedWith(ResponseError);
  });

  it("post resource with body and returns 201", () => {
    fetchMock.post("*", 201);

    return client.post("/over/the", {}, {}, { id: "rainbow" }).then(() => {
      expect(fetchMock.lastUrl()).to.equal("https://somewhere/over/the");
    });
  });

  it("post resource with site id in query param, body and returns 201", () => {
    fetchMock.post("*", 201);

    return client
      .post("/over", {}, { id: "the" }, { content: "rainbow" })
      .then(() => {
        expect(fetchMock.lastUrl()).to.equal("https://somewhere/over?id=the");
      });
  });
});
