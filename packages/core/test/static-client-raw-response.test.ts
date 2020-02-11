/*
 * Copyright (c) 2020, salesforce.com, inc.
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

import { BaseClient } from "../src/base/client";
import {
  _delete,
  _get,
  _patch,
  _post,
  _put,
  Response
} from "../src/base/staticClient";

describe("rawResponse tests", () => {
  let client;

  beforeEach(() => {
    client = new BaseClient({ baseUri: "https://somewhere" });
  });
  afterEach(nock.cleanAll);

  it("makes correct call for true", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });
    const scope = nock("https://somewhere")
      .get("/over/the/rainbow")
      .reply(200, { mock: "data" });

    return _get({
      client: client,
      path: "/over/the/rainbow",
      rawResponse: true
    }).then(res => {
      expect(res).to.be.a("Response");
      expect(nock.isDone()).to.be.true;
    });
  });

  it("makes correct call for false", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });
    const scope = nock("https://somewhere")
      .get("/over/the/rainbow")
      .reply(200, { mock: "data" });

    return _get({
      client: client,
      path: "/over/the/rainbow",
      rawResponse: false
    }).then(res => {
      expect(res).to.not.be.a("Response");
      expect(nock.isDone()).to.be.true;
    });
  });

  it("makes correct call for null", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });
    const scope = nock("https://somewhere")
      .get("/over/the/rainbow")
      .reply(200, { mock: "data" });

    return _get({
      client: client,
      path: "/over/the/rainbow",
      rawResponse: null
    }).then(res => {
      expect(res).to.not.be.a("Response");
      expect(nock.isDone()).to.be.true;
    });
  });

  it("deletes resource and returns 200", () => {
    const scope = nock("https://somewhere")
      .delete("/over/the/rainbow")
      .reply(200);

    return _delete({
      client: client,
      path: "/over/the/rainbow",
      rawResponse: true
    }).then(res => {
      expect(res).to.be.a("Response");
      expect(nock.isDone()).to.be.true;
    });
  });

  it("is not ok when attempting to delete nonexistent resource", () => {
    const scope = nock("https://somewhere")
      .delete("/over/the/rainbow")
      .reply(404);

    return _delete({
      client: client,
      path: "/over/the/rainbow",
      rawResponse: true
    }).then(res => {
      expect(res).to.be.a("Response");
      expect((res as Response).status).to.eql(404);
      expect(nock.isDone()).to.be.true;
    });
  });

  it("post resource and returns 201", () => {
    const scope = nock("https://somewhere")
      .post("/over/the/rainbow")
      .reply(201);

    return _post({
      client: client,
      path: "/over/the/rainbow",
      rawResponse: true,
      body: {}
    }).then(res => {
      expect(res).to.be.a("Response");
      expect(nock.isDone()).to.be.true;
    });
  });

  it("is not ok when attempting to post nonexistent collection", () => {
    const scope = nock("https://somewhere")
      .post("/over/the/rainbow")
      .reply(404);

    return _post({
      client: client,
      path: "/over/the/rainbow",
      rawResponse: true,
      body: { location: "oz" }
    }).then(res => {
      expect(res).to.be.a("Response");
      expect((res as Response).status).to.eql(404);
      expect(nock.isDone()).to.be.true;
    });
  });

  it("put resource and returns 201", () => {
    const scope = nock("https://somewhere")
      .put("/over/the/rainbow")
      .reply(201);

    return _put({
      client: client,
      path: "/over/the/rainbow",
      rawResponse: true,
      body: {}
    }).then(res => {
      expect(res).to.be.a("Response");
      expect(nock.isDone()).to.be.true;
    });
  });

  it("is not ok when attempting to put nonexistent resource", () => {
    const scope = nock("https://somewhere")
      .put("/over/the/rainbow")
      .reply(404);

    return _put({
      client: client,
      path: "/over/the/rainbow",
      rawResponse: true,
      body: {}
    }).then(res => {
      expect(res).to.be.a("Response");
      expect((res as Response).status).to.eql(404);
      expect(nock.isDone()).to.be.true;
    });
  });

  it("patch resource and returns 200", () => {
    const scope = nock("https://somewhere")
      .patch("/over/the/rainbow")
      .reply(200);

    return _patch({
      client: client,
      path: "/over/the/rainbow",
      rawResponse: true,
      body: {}
    }).then(res => {
      expect(res).to.be.a("Response");
      expect(nock.isDone()).to.be.true;
    });
  });

  it("is not ok when attempting to patch nonexistent resource", () => {
    const scope = nock("https://somewhere")
      .patch("/over/the/rainbow")
      .reply(404);

    return _patch({
      client: client,
      path: "/over/the/rainbow",
      rawResponse: true,
      body: {}
    }).then(res => {
      expect(res).to.be.a("Response");
      expect((res as Response).status).to.eql(404);
      expect(nock.isDone()).to.be.true;
    });
  });
});
