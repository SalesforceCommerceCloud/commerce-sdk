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

import { BaseClient } from "../src/base/client";
import {
  _delete,
  _get,
  _patch,
  _post,
  _put,
  ResponseError
} from "../src/base/staticClient";

const CONNECTION_CLOSE = { connection: "close" };
const CONNECTION_KEEP_ALIVE = { connection: "keep-alive" };

describe("base client get test", () => {
  afterEach(nock.cleanAll);

  it("makes correct call", async () => {
    const client = new BaseClient({ baseUri: "https://get.test" });
    nock("https://get.test")
      .get("/get")
      .reply(200, { mock: "data" });

    const data = await _get({ client: client, path: "/get" });
    expect(data).to.eql({ mock: "data" });
    expect(nock.isDone()).to.be.true;
  });
});

describe("base client delete test", () => {
  let client;

  beforeEach(() => {
    client = new BaseClient({ baseUri: "https://delete.test" });
  });
  afterEach(nock.cleanAll);

  it("deletes resource and returns 200", async () => {
    nock("https://delete.test")
      .delete("/delete")
      .reply(200);

    await _delete({
      client: client,
      path: "/delete"
    });
    expect(nock.isDone()).to.be.true;
  });

  it("is not ok when attempting to delete nonexistent resource", () => {
    nock("https://delete.test")
      .delete("/delete/404")
      .reply(404);

    return _delete({
      client: client,
      path: "/delete/404"
    }).should.eventually.be.rejectedWith(ResponseError);
  });

  it("deletes resource with id and returns 200", async () => {
    nock("https://delete.test")
      .delete("/delete/200")
      .reply(200);

    await _delete({
      client: client,
      path: "/delete/{id}",
      pathParameters: { id: "200" }
    });
    expect(nock.isDone()).to.be.true;
  });

  it("deletes resource with id in query param and returns 200", async () => {
    nock("https://delete.test")
      .delete("/delete")
      .query({ id: "200" })
      .reply(200);

    await _delete({
      client: client,
      path: "/delete",
      queryParameters: { id: "200" }
    });
    expect(nock.isDone()).to.be.true;
  });
});

describe("base client post test", () => {
  let client;

  beforeEach(() => {
    client = new BaseClient({ baseUri: "https://post.test" });
  });
  afterEach(nock.cleanAll);

  it("post resource and returns 201", async () => {
    nock("https://post.test")
      .post("/post/201")
      .reply(201);

    await _post({
      client: client,
      path: "/post/201",
      body: {}
    });
    expect(nock.isDone()).to.be.true;
  });

  it("is not ok when attempting to post nonexistent collection", () => {
    nock("https://post.test")
      .post("/post/404")
      .reply(404);

    return _post({
      client: client,
      path: "/post/404",
      body: { location: "oz" }
    }).should.eventually.be.rejectedWith(ResponseError);
  });

  it("post resource with body and returns 201", async () => {
    nock("https://post.test")
      .post("/post/201")
      .reply(201, function(url, body) {
        return body;
      });

    const response = await _post({
      client: client,
      path: "/post/201",
      body: { location: "oz" }
    });
    expect(nock.isDone()).to.be.true;
    expect(response).to.be.deep.equal({ location: "oz" });
  });

  it("post resource with site id in query param, body and returns 201", async () => {
    nock("https://post.test")
      .post("/post/create")
      .query({ id: "something" })
      .reply(201, function(url, body) {
        return body;
      });

    const response = await _post({
      client: client,
      path: "/post/create",
      queryParameters: { id: "something" },
      body: { content: "new" }
    });
    expect(nock.isDone()).to.be.true;
    expect(response).to.be.deep.equal({ content: "new" });
  });
});

describe("base client put test", () => {
  let client;

  beforeEach(() => {
    client = new BaseClient({ baseUri: "https://put.test" });
  });
  afterEach(nock.cleanAll);

  it("put resource and returns 201", async () => {
    nock("https://put.test")
      .put("/put")
      .reply(201, function(url, body) {
        return body;
      });

    const response = await _put({
      client: client,
      path: "/put",
      body: { something: "foo" }
    });
    expect(nock.isDone()).to.be.true;
    expect(response).to.be.deep.equal({ something: "foo" });
  });

  it("is not ok when attempting to put nonexistent resource", () => {
    nock("https://put.test")
      .put("/put/404")
      .reply(404);

    return _put({
      client: client,
      path: "/put/404",
      body: {}
    }).should.eventually.be.rejectedWith(ResponseError);
  });

  it("put resource with body and returns 200", async () => {
    nock("https://put.test")
      .put("/with-body/200")
      .reply(200, function(url, body) {
        return body;
      });

    const response = await _put({
      client: client,
      path: "/with-body/200",
      body: { body: "is_here" }
    });
    expect(nock.isDone()).to.be.true;
    expect(response).to.be.deep.equal({ body: "is_here" });
  });

  it("put resource with body and returns 204", async () => {
    nock("https://put.test")
      .put("/with/body/204")
      .reply(204, function(url, body) {
        return body;
      });

    await _put({
      client: client,
      path: "/with/body/204",
      body: {}
    });
    expect(nock.isDone()).to.be.true;
  });

  it("put resource with site id in query param, body and returns 201", async () => {
    nock("https://put.test")
      .put("/with-id/201")
      .query({ id: "foo" })
      .reply(201, function(url, body) {
        return body;
      });

    const response = await _put({
      client: client,
      path: "/with-id/201",
      queryParameters: { id: "foo" },
      body: { content: "rainbow" }
    });
    expect(nock.isDone()).to.be.true;
    expect(response).to.be.deep.equal({ content: "rainbow" });
  });
});

describe("base client patch test", () => {
  let client;

  beforeEach(() => {
    client = new BaseClient({ baseUri: "https://patch.test" });
  });
  afterEach(nock.cleanAll);

  it("patch resource and returns 200", async () => {
    nock("https://patch.test")
      .patch("/patch/200")
      .reply(200);

    await _patch({ client: client, path: "/patch/200", body: {} });
    expect(nock.isDone()).to.be.true;
  });

  it("is not ok when attempting to patch nonexistent resource", () => {
    nock("https://patch.test")
      .patch("/patch/404")
      .reply(404);

    return _patch({
      client: client,
      path: "/patch/404",
      body: {}
    }).should.eventually.be.rejectedWith(ResponseError);
  });

  it("patch resource with body and returns 200", async () => {
    nock("https://patch.test")
      .patch("/with-body/200")
      .reply(200);

    await _patch({
      client: client,
      path: "/with-body/200",
      body: {}
    });
    expect(nock.isDone()).to.be.true;
  });

  it("patch resource with body and returns 204", async () => {
    nock("https://patch.test")
      .patch("/with-body/204")
      .reply(204);

    await _patch({
      client: client,
      path: "/with-body/204",
      body: {}
    });
    expect(nock.isDone()).to.be.true;
  });

  it("patch resource with site id in query param, body and returns 200", async () => {
    nock("https://patch.test")
      .patch("/with-id")
      .query({ id: "the" })
      .reply(200);

    await _patch({
      client: client,
      path: "/with-id",
      queryParameters: { id: "the" },
      body: { content: "rainbow" }
    });
    expect(nock.isDone()).to.be.true;
  });
});

describe("base client test with headers", () => {
  afterEach(nock.cleanAll);

  const LANGUAGE_HEADER = { "Accept-Language": "en-US" };
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
      .get("/get/headers")
      .reply(200, { mock: "data" });

    await _get({ client: client, path: "/get/headers" });
    expect(nock.isDone()).to.be.true;
  });

  it("makes correct call with two headers", async () => {
    const client = new BaseClient({
      baseUri: "https://headers.test",
      headers: TWO_HEADER
    });
    nock("https://headers.test", { reqheaders: TWO_HEADER })
      .get("/get/two/headers")
      .reply(200, { mock: "data" });

    await _get({ client: client, path: "/get/two/headers" });
    expect(nock.isDone()).to.be.true;
  });

  it("makes correct call for post with two headers", async () => {
    const client = new BaseClient({
      baseUri: "https://headers.test",
      headers: TWO_HEADER
    });
    nock("https://headers.test", { reqheaders: TWO_HEADER })
      .post("/post/two/headers")
      .reply(201, {});

    await _post({ client: client, path: "/post/two/headers", body: {} });
    expect(nock.isDone()).to.be.true;
  });

  it("makes call with connection header set to close by default", async () => {
    const client = new BaseClient({
      baseUri: "https://headers.test"
    });

    nock("https://headers.test", { reqheaders: CONNECTION_CLOSE })
      .get("/connection/close")
      .reply(200, { mock: "data" });

    await _get({ client: client, path: "/connection/close" });
    expect(nock.isDone()).to.be.true;
  });

  it("makes call with the connection header set in the client", async () => {
    const client = new BaseClient({
      baseUri: "https://headers.test",
      headers: CONNECTION_KEEP_ALIVE
    });

    nock("https://headers.test", { reqheaders: CONNECTION_KEEP_ALIVE })
      .get("/connection/alive")
      .reply(200, { mock: "data" });

    await _get({ client: client, path: "/connection/alive" });
    expect(nock.isDone()).to.be.true;
  });
});

describe("base client test with endpoint headers", () => {
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
      baseUri: "https://ep.headers.test"
    });
    nock("https://ep.headers.test", { reqheaders: LANGUAGE_HEADER })
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
      baseUri: "https://ep.headers.test"
    });
    nock("https://ep.headers.test", { reqheaders: TWO_HEADER })
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
      baseUri: "https://ep.headers.test"
    });
    nock("https://ep.headers.test", { reqheaders: TWO_HEADER })
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
      baseUri: "https://ep.headers.test",
      headers: TWO_HEADER
    });
    nock("https://ep.headers.test", { reqheaders: MERGE_HEADER })
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

  it("makes call with connection header passed to the get function ", async () => {
    const client = new BaseClient({
      baseUri: "https://ep.headers.test"
    });

    nock("https://ep.headers.test", { reqheaders: CONNECTION_KEEP_ALIVE })
      .get("/connection/header")
      .reply(200, { mock: "data" });

    await _get({
      client: client,
      path: "/connection/header",
      headers: CONNECTION_KEEP_ALIVE
    });
    expect(nock.isDone()).to.be.true;
  });
});

describe("client override testing", () => {
  afterEach(nock.cleanAll);

  it("Overriding a header works", async () => {
    const client = new BaseClient({
      baseUri: "https://override.test",
      headers: { Authorization: "Testing" }
    });

    nock("https://override.test")
      .get("/auth/changed")
      .matchHeader("Authorization", "Changed")
      .reply(200, {});

    await _get({
      client: client,
      path: "/auth/changed",
      headers: { Authorization: "Changed" }
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
});
