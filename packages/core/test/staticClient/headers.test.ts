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

import { BaseClient } from "../../src/base/client";
import { _get, _post, getHeader } from "../../src/base/staticClient";

const CONNECTION_CLOSE = { connection: "close" };
const CONNECTION_KEEP_ALIVE = { connection: "keep-alive" };

describe("Base Client headers", () => {
  describe("Headers specified on client", () => {
    afterEach(nock.cleanAll);

    const LANGUAGE_HEADER = { "Accept-Language": "en-US" };
    const TWO_HEADER = {
      "Accept-Language": "en-US",
      "Max-Forwards": "10"
    };
    const CONTENT_TYPE_JSON = { "Content-Type": "application/json" };
    const CONTENT_TYPE_XML = { "Content-Type": "text/xml" };

    it("makes correct get call with headers", () => {
      const client = new BaseClient({
        baseUri: "https://somewhere",
        headers: LANGUAGE_HEADER
      });
      const scope = nock("https://somewhere", { reqheaders: LANGUAGE_HEADER })
        .get("/over/the/rainbow")
        .reply(200, { mock: "data" });

      return _get({ client: client, path: "/over/the/rainbow" }).then(() => {
        expect(scope.isDone()).to.be.true;
      });
    });

    it("makes correct call with two headers", () => {
      const client = new BaseClient({
        baseUri: "https://somewhere",
        headers: TWO_HEADER
      });
      const scope = nock("https://somewhere", { reqheaders: TWO_HEADER })
        .get("/over/the/rainbow")
        .reply(200, { mock: "data" });

      return _get({ client: client, path: "/over/the/rainbow" }).then(() => {
        expect(scope.isDone()).to.be.true;
      });
    });

    it("makes correct call for post with two headers", () => {
      const client = new BaseClient({
        baseUri: "https://somewhere",
        headers: TWO_HEADER
      });
      const scope = nock("https://somewhere", { reqheaders: TWO_HEADER })
        .post("/over/the/rainbow")
        .reply(201, {});

      return _post({
        client: client,
        path: "/over/the/rainbow",
        body: {}
      }).then(() => {
        expect(scope.isDone()).to.be.true;
      });
    });

    it("cannot overwrite content-type for post", () => {
      const client = new BaseClient({
        baseUri: "https://somewhere",
        headers: CONTENT_TYPE_XML
      });
      const scope = nock("https://somewhere", { reqheaders: CONTENT_TYPE_JSON })
        .post("/over/the/rainbow")
        .reply(201, {});

      return _post({
        client: client,
        path: "/over/the/rainbow",
        body: {}
      }).then(() => {
        expect(scope.isDone()).to.be.true;
      });
    });

    it("makes call with connection header set to close by default", () => {
      const client = new BaseClient({
        baseUri: "https://somewhere"
      });

      const scope = nock("https://somewhere", { reqheaders: CONNECTION_CLOSE })
        .get("/over/the/rainbow")
        .reply(200, { mock: "data" });

      return _get({ client: client, path: "/over/the/rainbow" }).then(() => {
        expect(scope.isDone()).to.be.true;
      });
    });

    it("makes call with the connection header set in the client", () => {
      const client = new BaseClient({
        baseUri: "https://somewhere",
        headers: CONNECTION_KEEP_ALIVE
      });

      const scope = nock("https://somewhere", {
        reqheaders: CONNECTION_KEEP_ALIVE
      })
        .get("/over/the/rainbow")
        .reply(200, { mock: "data" });

      return _get({ client: client, path: "/over/the/rainbow" }).then(() => {
        expect(scope.isDone()).to.be.true;
      });
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
    const CONTENT_TYPE_JSON = { "Content-Type": "application/json" };
    const CONTENT_TYPE_XML = { "Content-Type": "text/xml" };

    it("makes correct get call with endpoint headers", () => {
      const client = new BaseClient({
        baseUri: "https://somewhere"
      });
      const scope = nock("https://somewhere", { reqheaders: LANGUAGE_HEADER })
        .get("/over/the/rainbow")
        .reply(200, { mock: "data" });

      return _get({
        client: client,
        path: "/over/the/rainbow",
        headers: LANGUAGE_HEADER
      }).then(() => {
        expect(scope.isDone()).to.be.true;
      });
    });

    it("makes correct call with two endpoint headers", () => {
      const client = new BaseClient({
        baseUri: "https://somewhere"
      });
      const scope = nock("https://somewhere", { reqheaders: TWO_HEADER })
        .get("/over/the/rainbow")
        .reply(200, { mock: "data" });

      return _get({
        client: client,
        path: "/over/the/rainbow",
        headers: TWO_HEADER
      }).then(() => {
        expect(scope.isDone()).to.be.true;
      });
    });

    it("makes correct call for post with two endpoint headers", () => {
      const client = new BaseClient({
        baseUri: "https://somewhere"
      });
      const scope = nock("https://somewhere", { reqheaders: TWO_HEADER })
        .post("/over/the/rainbow")
        .reply(201, {});

      return _post({
        client: client,
        path: "/over/the/rainbow",
        headers: TWO_HEADER,
        body: {}
      }).then(() => {
        expect(scope.isDone()).to.be.true;
      });
    });

    it("makes correct call for post with client and endpoint headers", () => {
      const client = new BaseClient({
        baseUri: "https://somewhere",
        headers: TWO_HEADER
      });
      const scope = nock("https://somewhere", { reqheaders: MERGE_HEADER })
        .post("/over/the/rainbow")
        .reply(201, {});

      return _post({
        client: client,
        path: "/over/the/rainbow",
        headers: LANGUAGE_HEADER,
        body: {}
      }).then(() => {
        expect(scope.isDone()).to.be.true;
      });
    });

    it("cannot overwrite content-type for post", () => {
      const client = new BaseClient({
        baseUri: "https://somewhere"
      });
      const scope = nock("https://somewhere", { reqheaders: CONTENT_TYPE_JSON })
        .post("/over/the/rainbow")
        .reply(201, {});

      return _post({
        client: client,
        path: "/over/the/rainbow",
        headers: CONTENT_TYPE_XML,
        body: {}
      }).then(() => {
        expect(scope.isDone()).to.be.true;
      });
    });

    it("makes call with connection header passed to the get function ", () => {
      const client = new BaseClient({
        baseUri: "https://somewhere"
      });

      const scope = nock("https://somewhere", {
        reqheaders: CONNECTION_KEEP_ALIVE
      })
        .get("/over/the/rainbow")
        .reply(200, { mock: "data" });

      return _get({
        client: client,
        path: "/over/the/rainbow",
        headers: CONNECTION_KEEP_ALIVE
      }).then(() => {
        expect(scope.isDone()).to.be.true;
      });
    });
  });

  describe("Normalized header helper", () => {
    it("returns the passed header if a header with the same name and same case exists", () => {
      const headers = { connection: "keep-alive" };
      const result = getHeader("connection", headers);
      expect(result).to.equal("connection");
    });

    it("returns the other header if a header with the same name and different case exists", () => {
      const headers = { Connection: "keep-alive" };
      const result = getHeader("coNneCtiOn", headers);
      expect(result).to.equal("Connection");
    });

    it("returns the passed header if a header with the same name does not exist", () => {
      const headers = { Con: "keep-alive" };
      const result = getHeader("Connection", headers);
      expect(result).to.equal("Connection");
    });
  });
});
