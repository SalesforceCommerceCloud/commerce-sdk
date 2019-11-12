"use strict";

const fetchMock = require("fetch-mock").sandbox();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodeFetch = require("node-fetch");
nodeFetch.default = fetchMock;

import { BaseClient } from "../src/base/client";
import { _get, _post, _delete } from "../src/base/static-client";
import { expect } from "chai";

describe("base client get test", () => {
  afterEach(fetchMock.restore);

  it("makes correct call", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });
    fetchMock.get("*", 200);

    return _get({ client: client, path: "/over/the/rainbow" }).then(() => {
      expect(fetchMock.lastUrl()).to.equal(
        "https://somewhere/over/the/rainbow"
      );
    });
  });
});

describe("base client delete test", () => {
  afterEach(fetchMock.restore);

  it("deletes resource and returns 200", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });

    fetchMock.delete("*", 200);

    return _delete({
      client: client,
      path: "/over/the/rainbow"
    }).then(res => {
      expect(res.ok).to.be.true;
      expect(fetchMock.lastUrl()).to.be.equal(
        "https://somewhere/over/the/rainbow"
      );
    });
  });

  it("is not ok when attempting to delete nonexistent resource", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });
    fetchMock.delete("*", 404);

    return _delete({
      client: client,
      path: "/over/the/rainbow"
    }).then(res => {
      expect(res.ok).to.be.false;
      expect(res.status).to.be.equal(404);
      expect(fetchMock.lastUrl()).to.be.equal(
        "https://somewhere/over/the/rainbow"
      );
    });
  });

  it("deletes resource with id and returns 200", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });

    fetchMock.delete("*", 200);

    return _delete({
      client: client,
      path: "/over/the/{id}",
      pathParameters: { id: "rainbow" }
    }).then(res => {
      expect(res.ok).to.be.true;
      expect(res.status).to.be.equal(200);
      expect(fetchMock.lastUrl()).to.be.equal(
        "https://somewhere/over/the/rainbow"
      );
    });
  });

  it("deletes resource with id in query param and returns 200", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });

    fetchMock.delete("*", 200);

    return _delete({
      client: client,
      path: "/over/the/",
      queryParameters: { id: "rainbow" }
    }).then(res => {
      expect(res.ok).to.be.true;
      expect(res.status).to.be.equal(200);
      expect(fetchMock.lastUrl()).to.be.equal(
        "https://somewhere/over/the/?id=rainbow"
      );
    });
  });
});

describe("base client post test", () => {
  afterEach(fetchMock.restore);

  it("post resource and returns 201", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });

    fetchMock.post("*", 201);

    return _post({
      client: client,
      path: "/over/the/rainbow",
      body: {}
    }).then(res => {
      expect(res.ok).to.be.true;
      expect(res.status).to.be.equal(201);
      expect(fetchMock.lastUrl()).to.be.equal(
        "https://somewhere/over/the/rainbow"
      );
    });
  });

  it("is not ok when attempting to post nonexistent collection", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });

    fetchMock.post("*", 404);

    return _post({
      client: client,
      path: "/over/the/rainbow",
      body: { location: "oz" }
    }).then(res => {
      expect(res.ok).to.be.false;
      expect(res.status).to.be.equal(404);
      expect(fetchMock.lastUrl()).to.be.equal(
        "https://somewhere/over/the/rainbow"
      );
    });
  });

  it("post resource with body and returns 201", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });

    fetchMock.post("*", 201);

    return _post({
      client: client,
      path: "/over/the",
      body: { location: "oz" }
    }).then(res => {
      expect(res.ok).to.be.true;
      expect(res.status).to.be.equal(201);
      expect(fetchMock.lastUrl()).to.be.equal("https://somewhere/over/the");
    });
  });

  it("post resource with site id in query param, body and returns 201", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });

    fetchMock.post("*", 201);

    return _post({
      client: client,
      path: "/over",
      queryParameters: { id: "the" },
      body: { content: "rainbow" }
    }).then(res => {
      expect(res.ok).to.be.true;
      expect(res.status).to.be.equal(201);
      expect(fetchMock.lastUrl()).to.be.equal("https://somewhere/over?id=the");
    });
  });
});
