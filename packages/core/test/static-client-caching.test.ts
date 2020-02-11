/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";

import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import nock from "nock";

const expect = chai.expect;

before(() => {
  chai.should();
  chai.use(chaiAsPromised);
});

import { BaseClient } from "../src/base/client";
import { _delete, _get, _patch, _post, _put } from "../src/base/staticClient";

describe("base client get test", () => {
  afterEach(nock.cleanAll);

  it("makes correct call once", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });
    const scope = nock("https://somewhere")
      .get("/once")
      .reply(200, { mock: "data" });

    return _get({ client: client, path: "/once" }).then(data => {
      expect(data).to.eql({ mock: "data" });
      expect(nock.isDone()).to.be.true;
    });
  });

  it("does not get from cache with request max-age=0", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });
    const scope = nock("https://somewhere")
      .get("/max-age-zero")
      .reply(200, { mock: "data" }, { "Cache-Control": "max-age=0" });
    scope
      .get("/max-age-zero")
      .reply(200, { mock: "newData" }, { "Cache-Control": "max-age=0" });

    return _get({ client: client, path: "/max-age-zero" }).then(data => {
      expect(data).to.eql({ mock: "data" });
      return _get({ client: client, path: "/max-age-zero" }).then(data => {
        expect(data).to.eql({ mock: "newData" });
        expect(nock.isDone()).to.be.true;
      });
    });
  });

  it("gets from cache with response expires fresh", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });
    const scope = nock("https://somewhere")
      .get("/fresh")
      .reply(
        200,
        { mock: "data" },
        { Expires: "Sun, 03 May 2055 23:02:37 GMT" }
      );
    scope
      .get("/fresh")
      .reply(
        200,
        { mock: "newData" },
        { Expires: "Sun, 03 May 2055 23:02:37 GMT" }
      );

    return _get({ client: client, path: "/fresh" }).then(data => {
      expect(data).to.eql({ mock: "data" });
      return _get({ client: client, path: "/fresh" }).then(data => {
        expect(data).to.eql({ mock: "data" });
        expect(nock.isDone()).to.be.false;
      });
    });
  });

  it("does not get from cache with response expires expired", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });
    const scope = nock("https://somewhere")
      .get("/expired")
      .reply(
        200,
        { mock: "data" },
        { Expires: "Sun, 03 May 2015 23:02:37 GMT" }
      );
    scope
      .get("/expired")
      .reply(
        200,
        { mock: "newData" },
        { Expires: "Sun, 03 May 2015 23:02:37 GMT" }
      );

    return _get({ client: client, path: "/expired" }).then(data => {
      expect(data).to.eql({ mock: "data" });
      return _get({ client: client, path: "/expired" }).then(data => {
        expect(data).to.eql({ mock: "newData" });
        expect(nock.isDone()).to.be.true;
      });
    });
  });

  it("caches with request max-age", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });
    const scope = nock("https://somewhere")
      .get("/max-age")
      .reply(200, { mock: "data" }, { "Cache-Control": "max-age=604800" });
    scope
      .get("/max-age")
      .reply(200, { mock: "newData" }, { "Cache-Control": "max-age=604800" });

    return _get({ client: client, path: "/max-age" }).then(data => {
      expect(data).to.eql({ mock: "data" });
      expect(nock.isDone()).to.be.false;
      return _get({ client: client, path: "/max-age" }).then(data => {
        expect(data).to.eql({ mock: "data" });
        expect(nock.isDone()).to.be.false;
      });
    });
  });

  it("bypasses caches with no cache", () => {
    const client = new BaseClient({
      baseUri: "https://somewhere",
      cacheManager: null
    });
    const scope = nock("https://somewhere")
      .get("/max-age-null-cache")
      .reply(200, { mock: "data" }, { "Cache-Control": "max-age=604800" });
    scope
      .get("/max-age-null-cache")
      .reply(200, { mock: "newData" }, { "Cache-Control": "max-age=604800" });

    return _get({ client: client, path: "/max-age-null-cache" }).then(data => {
      expect(data).to.eql({ mock: "data" });
      expect(nock.isDone()).to.be.false;
      return _get({ client: client, path: "/max-age-null-cache" }).then(
        data => {
          expect(data).to.eql({ mock: "newData" });
          expect(nock.isDone()).to.be.true;
        }
      );
    });
  });

  it("bypasses cache with no-cache", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });
    const scope = nock("https://somewhere")
      .get("/max-age-no-cache")
      .reply(200, { mock: "data" }, { "Cache-Control": "max-age=604800" });
    scope
      .get("/max-age-no-cache")
      .reply(200, { mock: "newData" }, { "Cache-Control": "max-age=604800" });

    return _get({ client: client, path: "/max-age-no-cache" }).then(data => {
      expect(data).to.eql({ mock: "data" });
      expect(nock.isDone()).to.be.false;
      return _get({
        client: client,
        path: "/max-age-no-cache",
        headers: { "Cache-Control": "no-cache" }
      }).then(data => {
        expect(data).to.eql({ mock: "newData" });
        expect(nock.isDone()).to.be.true;
      });
    });
  });

  it("doesn't cache post request max-age", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });
    const scope = nock("https://somewhere")
      .post("/post-max-age")
      .reply(200, { mock: "data" }, { "Cache-Control": "max-age=604800" });
    scope
      .post("/post-max-age")
      .reply(200, { mock: "newData" }, { "Cache-Control": "max-age=604800" });

    return _post({ client: client, path: "/post-max-age", body: {} }).then(
      data => {
        expect(data).to.eql({ mock: "data" });
        expect(nock.isDone()).to.be.false;
        return _post({ client: client, path: "/post-max-age", body: {} }).then(
          data => {
            expect(data).to.eql({ mock: "newData" });
            expect(nock.isDone()).to.be.true;
          }
        );
      }
    );
  });

  it("doesn't cache patch request max-age", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });
    const scope = nock("https://somewhere")
      .patch("/patch-max-age")
      .reply(200, { mock: "data" }, { "Cache-Control": "max-age=604800" });
    scope
      .patch("/patch-max-age")
      .reply(200, { mock: "newData" }, { "Cache-Control": "max-age=604800" });

    return _patch({ client: client, path: "/patch-max-age", body: {} }).then(
      data => {
        expect(data).to.eql({ mock: "data" });
        expect(nock.isDone()).to.be.false;
        return _patch({
          client: client,
          path: "/patch-max-age",
          body: {}
        }).then(data => {
          expect(data).to.eql({ mock: "newData" });
          expect(nock.isDone()).to.be.true;
        });
      }
    );
  });

  it("doesn't cache put request max-age", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });
    const scope = nock("https://somewhere")
      .put("/put-max-age")
      .reply(200, { mock: "data" }, { "Cache-Control": "max-age=604800" });
    scope
      .put("/put-max-age")
      .reply(200, { mock: "newData" }, { "Cache-Control": "max-age=604800" });

    return _put({ client: client, path: "/put-max-age", body: {} }).then(
      data => {
        expect(data).to.eql({ mock: "data" });
        expect(nock.isDone()).to.be.false;
        return _put({ client: client, path: "/put-max-age", body: {} }).then(
          data => {
            expect(data).to.eql({ mock: "newData" });
            expect(nock.isDone()).to.be.true;
          }
        );
      }
    );
  });
});
