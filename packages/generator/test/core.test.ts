"use strict";

const fetchMock = require("fetch-mock").sandbox();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodeFetch = require("node-fetch");
nodeFetch.default = fetchMock;

import { assert } from "chai";

import { BaseClient } from "../src/core/base/client";

describe("base client test", () => {
  it("makes correct call", () => {
    const client = new BaseClient("https://somewhere");

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
