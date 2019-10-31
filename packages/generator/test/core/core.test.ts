"use strict";

const fetchMock = require("fetch-mock").sandbox();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodeFetch = require("node-fetch");
nodeFetch.default = fetchMock;

import { assert } from "chai";

import { BaseClient } from "../../src/core/base/client";

describe("base client get test", () => {
  it("makes correct call", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });

    fetchMock.get("*", 200);

    return client
      .get("/over/the/rainbow")
      .then(() => {
        assert.equal(fetchMock.lastUrl(), "https://somewhere/over/the/rainbow");
      })
      .finally(() => {
        fetchMock.restore();
      });
  });
});

describe("base client delete test", () => {
  afterEach(fetchMock.restore);

  it("deletes resource and returns 200", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });

    fetchMock.delete("*", 200);

    return client.delete("/over/the/rainbow").then(res => {
      assert.isTrue(res.ok);
      assert.equal(fetchMock.lastUrl(), "https://somewhere/over/the/rainbow");
    });
  });

  it("is not ok when attempting to delete nonexistent resource", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });

    fetchMock.delete("*", 404);

    return client.delete("/over/the/rainbow").then(res => {
      assert.isFalse(res.ok);
      assert.equal(fetchMock.lastUrl(), "https://somewhere/over/the/rainbow");
    });
  });

  it("deletes resource with id and returns 200", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });

    fetchMock.delete("*", 200);

    return client.delete("/over/the/{id}", { id: "rainbow" }).then(res => {
      assert.isTrue(res.ok);
      assert.equal(fetchMock.lastUrl(), "https://somewhere/over/the/rainbow");
    });
  });

  it("deletes resource with id in query param and returns 200", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });

    fetchMock.delete("*", 200);

    return client.delete("/over/the/", {}, { id: "rainbow" }).then(res => {
      assert.isTrue(res.ok);
      assert.equal(
        fetchMock.lastUrl(),
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

    return client.post("/over/the/rainbow", {}, {}, {}).then(res => {
      assert.isTrue(res.ok);
      assert.equal(fetchMock.lastUrl(), "https://somewhere/over/the/rainbow");
    });
  });

  it("is not ok when attempting to post nonexistent collection", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });

    fetchMock.post("*", 404);

    return client.post("/over/the/rainbow", {}, {}, {}).then(res => {
      assert.isFalse(res.ok);
      assert.equal(fetchMock.lastUrl(), "https://somewhere/over/the/rainbow");
    });
  });

  it("post resource with body and returns 201", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });

    fetchMock.post("*", 201);

    return client.post("/over/the", {}, {}, { id: "rainbow" }).then(res => {
      assert.isTrue(res.ok);
      assert.equal(fetchMock.lastUrl(), "https://somewhere/over/the");
    });
  });

  it("post resource with site id in query param, body and returns 201", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });

    fetchMock.post("*", 201);

    return client
      .post("/over", {}, { id: "the" }, { content: "rainbow" })
      .then(res => {
        assert.isTrue(res.ok);
        assert.equal(fetchMock.lastUrl(), "https://somewhere/over?id=the");
      });
  });
});
