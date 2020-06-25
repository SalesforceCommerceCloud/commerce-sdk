/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";

import nock from "nock";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

const expect = chai.expect;

before(() => {
  chai.should();
  chai.use(chaiAsPromised);
});

import {
  BaseClient,
  USER_AGENT as USER_AGENT_STR
} from "../../src/base/client";
import { _get, _post, exportHeadersAsMap } from "../../src/base/staticClient";
import { Headers } from "minipass-fetch";

// Common headers used in tests
const CONNECTION_CLOSE = { connection: "close" };
const CONNECTION_KEEP_ALIVE = { connection: "keep-alive" };
const LANGUAGE_HEADER = { "Accept-Language": "en-US" };

describe("Base Client headers", () => {
  describe("Headers specified on client", () => {
    afterEach(nock.cleanAll);

    const TWO_HEADER = {
      "Accept-Language": "en-US",
      "Max-Forwards": "10"
    };

    it("makes correct get call with headers", async () => {
      const client = new BaseClient({
        baseUri: "https://headers.test",
        headers: LANGUAGE_HEADER
      });
      nock("https://headers.test", { reqheaders: LANGUAGE_HEADER })
        .get("/client/get/headers")
        .reply(200, { mock: "data" });

      await _get({ client: client, path: "/client/get/headers" });
      expect(nock.isDone()).to.be.true;
    });

    it("makes correct call with two headers", async () => {
      const client = new BaseClient({
        baseUri: "https://headers.test",
        headers: TWO_HEADER
      });
      nock("https://headers.test", { reqheaders: TWO_HEADER })
        .get("/client/get/two/headers")
        .reply(200, { mock: "data" });

      await _get({ client: client, path: "/client/get/two/headers" });
      expect(nock.isDone()).to.be.true;
    });

    it("makes correct call for post with two headers", async () => {
      const client = new BaseClient({
        baseUri: "https://headers.test",
        headers: TWO_HEADER
      });
      nock("https://headers.test", { reqheaders: TWO_HEADER })
        .post("/client/post/two/headers")
        .reply(201, {});

      await _post({
        client: client,
        path: "/client/post/two/headers",
        body: {}
      });
      expect(nock.isDone()).to.be.true;
    });

    it("makes call with connection header set to close by default", async () => {
      const client = new BaseClient({
        baseUri: "https://headers.test"
      });

      nock("https://headers.test", { reqheaders: CONNECTION_CLOSE })
        .get("/client/connection/close")
        .reply(200, { mock: "data" });

      await _get({ client: client, path: "/client/connection/close" });
      expect(nock.isDone()).to.be.true;
    });

    it("makes call with the connection header set in the client", async () => {
      const client = new BaseClient({
        baseUri: "https://headers.test",
        headers: CONNECTION_KEEP_ALIVE
      });

      nock("https://headers.test", { reqheaders: CONNECTION_KEEP_ALIVE })
        .get("/client/connection/alive")
        .reply(200, { mock: "data" });

      await _get({ client: client, path: "/client/connection/alive" });
      expect(nock.isDone()).to.be.true;
    });

    it("makes call with the connection header set in the client", async () => {
      const client = new BaseClient({
        baseUri: "https://headers.test",
        headers: CONNECTION_KEEP_ALIVE
      });

      nock("https://headers.test", { reqheaders: CONNECTION_KEEP_ALIVE })
        .get("/client/connection/alive")
        .reply(200, { mock: "data" });

      await _get({ client: client, path: "/client/connection/alive" });
      expect(nock.isDone()).to.be.true;
    });
  });

  describe("Headers specified at endpoint", () => {
    afterEach(nock.cleanAll);

    const LANGUAGE_HEADER = { "Accept-Language": "en-US" };
    const TWO_HEADER = {
      "Accept-Language": "fr-CH",
      "Max-Forwards": "10"
    };
    const MERGE_HEADER = {
      "Accept-Language": "en-US",
      "Max-Forwards": "10"
    };

    it("makes correct get call with endpoint headers", async () => {
      const client = new BaseClient({
        baseUri: "https://headers.test"
      });
      nock("https://headers.test", { reqheaders: LANGUAGE_HEADER })
        .get("/get/with/language")
        .reply(200, { mock: "data" });

      await _get({
        client: client,
        path: "/get/with/language",
        headers: LANGUAGE_HEADER
      });
      expect(nock.isDone()).to.be.true;
    });

    it("makes correct call with two endpoint headers", async () => {
      const client = new BaseClient({
        baseUri: "https://headers.test"
      });
      nock("https://headers.test", { reqheaders: TWO_HEADER })
        .get("/get/two/headers")
        .reply(200, { mock: "data" });

      await _get({
        client: client,
        path: "/get/two/headers",
        headers: TWO_HEADER
      });
      expect(nock.isDone()).to.be.true;
    });

    it("makes correct call for post with two endpoint headers", async () => {
      const client = new BaseClient({
        baseUri: "https://headers.test"
      });
      nock("https://headers.test", { reqheaders: TWO_HEADER })
        .post("/post/two/headers")
        .reply(201, {});

      await _post({
        client: client,
        path: "/post/two/headers",
        headers: TWO_HEADER,
        body: {}
      });
      expect(nock.isDone()).to.be.true;
    });

    it("makes correct call for post with client and endpoint headers", async () => {
      const client = new BaseClient({
        baseUri: "https://headers.test",
        headers: TWO_HEADER
      });
      nock("https://headers.test", { reqheaders: MERGE_HEADER })
        .post("/post/with/header")
        .reply(201, {});

      await _post({
        client: client,
        path: "/post/with/header",
        headers: LANGUAGE_HEADER,
        body: {}
      });
      expect(nock.isDone()).to.be.true;
    });

    it("Overriding a header works with different casing", async () => {
      const client = new BaseClient({
        baseUri: "https://override.test",
        headers: { authorization: "Testing" }
      });

      nock("https://override.test")
        .get("/auth/changed/casing")
        .matchHeader("Authorization", "Changed")
        .reply(200, {});

      await _get({
        client: client,
        path: "/auth/changed/casing",
        headers: { Authorization: "Changed" }
      });
      expect(nock.isDone()).to.be.true;
    });

    it("makes call with connection header passed to the get function ", async () => {
      const client = new BaseClient({
        baseUri: "https://headers.test"
      });

      nock("https://headers.test", { reqheaders: CONNECTION_KEEP_ALIVE })
        .get("/connection/header")
        .reply(200, { mock: "data" });

      await _get({
        client: client,
        path: "/connection/header",
        headers: CONNECTION_KEEP_ALIVE
      });
      expect(nock.isDone()).to.be.true;
    });

    it("Merge headers together", async () => {
      const client = new BaseClient({
        baseUri: "https://override.test",
        headers: { "X-Custom-Header": "Custom" }
      });

      nock("https://override.test")
        .get("/merge/headers")
        .matchHeader("Authorization", "Changed")
        .matchHeader("X-Custom-Header", "Custom")
        .reply(200, {});

      await _get({
        client: client,
        path: "/merge/headers",
        headers: { Authorization: "Changed" }
      });
      expect(nock.isDone()).to.be.true;
    });
  });

  describe("getObjectFromResponse", () => {

    it("should return a map of headers", () => {
      const headersMap = {
        authorization: "Bearer token",
        connection: "close"
      }
      const headers = new Headers(headersMap);

      expect(exportHeadersAsMap(headers)).to.deep.equal(headersMap);
    });

    it("should return a comma separated list if a header has multiple values", () => {
      const headersMap = {
        accept: "text/plain, text/html"
      }
      const headers: Headers = new Headers(headersMap);

      expect(exportHeadersAsMap(headers)).to.deep.equal(headersMap);
    });

    it("should return an empty map if no headers are passed", () => {
      expect(exportHeadersAsMap(new Headers())).to.deep.equal({});
    });
  });
});
