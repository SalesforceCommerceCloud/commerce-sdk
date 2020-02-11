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

describe("base client get test", () => {
  afterEach(nock.cleanAll);

  it("makes correct call", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });
    const scope = nock("https://somewhere")
      .get("/over/the/rainbow")
      .reply(200, { mock: "data" });

    return _get({ client: client, path: "/over/the/rainbow" }).then(data => {
      expect(data).to.eql({ mock: "data" });
      expect(nock.isDone()).to.be.true;
    });
  });
});

describe("base client delete test", () => {
  let client;

  beforeEach(() => {
    client = new BaseClient({ baseUri: "https://somewhere" });
  });
  afterEach(nock.cleanAll);

  it("deletes resource and returns 200", () => {
    const scope = nock("https://somewhere")
      .delete("/over/the/rainbow")
      .reply(200);

    return _delete({
      client: client,
      path: "/over/the/rainbow"
    }).then(res => {
      expect(nock.isDone()).to.be.true;
    });
  });

  it("is not ok when attempting to delete nonexistent resource", () => {
    const scope = nock("https://somewhere")
      .delete("/over/the/rainbow")
      .reply(404);

    return _delete({
      client: client,
      path: "/over/the/rainbow"
    }).should.eventually.be.rejectedWith(ResponseError);
  });

  it("deletes resource with id and returns 200", () => {
    const scope = nock("https://somewhere")
      .delete("/over/the/rainbow")
      .reply(200);

    return _delete({
      client: client,
      path: "/over/the/{id}",
      pathParameters: { id: "rainbow" }
    }).then(res => {
      expect(nock.isDone()).to.be.true;
    });
  });

  it("deletes resource with id in query param and returns 200", () => {
    const scope = nock("https://somewhere")
      .delete("/over/the")
      .query({ id: "rainbow" })
      .reply(200);

    return _delete({
      client: client,
      path: "/over/the",
      queryParameters: { id: "rainbow" }
    }).then(res => {
      expect(nock.isDone()).to.be.true;
    });
  });
});

describe("base client post test", () => {
  let client;

  beforeEach(() => {
    client = new BaseClient({ baseUri: "https://somewhere" });
  });
  afterEach(nock.cleanAll);

  it("post resource and returns 201", () => {
    const scope = nock("https://somewhere")
      .post("/over/the/rainbow")
      .reply(201);

    return _post({
      client: client,
      path: "/over/the/rainbow",
      body: {}
    }).then(res => {
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
      body: { location: "oz" }
    }).should.eventually.be.rejectedWith(ResponseError);
  });

  it("post resource with body and returns 201", () => {
    const scope = nock("https://somewhere")
      .post("/over/the")
      .reply(201);

    return _post({
      client: client,
      path: "/over/the",
      body: { location: "oz" }
    }).then(res => {
      expect(nock.isDone()).to.be.true;
    });
  });

  it("post resource with site id in query param, body and returns 201", () => {
    const scope = nock("https://somewhere")
      .post("/over")
      .query({ id: "the" })
      .reply(201);

    return _post({
      client: client,
      path: "/over",
      queryParameters: { id: "the" },
      body: { content: "rainbow" }
    }).then(res => {
      expect(nock.isDone()).to.be.true;
    });
  });
});

describe("base client put test", () => {
  let client;

  beforeEach(() => {
    client = new BaseClient({ baseUri: "https://somewhere" });
  });
  afterEach(nock.cleanAll);

  it("put resource and returns 201", () => {
    const scope = nock("https://somewhere")
      .put("/over/the/rainbow")
      .reply(201);

    return _put({ client: client, path: "/over/the/rainbow", body: {} }).then(
      () => {
        expect(nock.isDone()).to.be.true;
      }
    );
  });

  it("is not ok when attempting to put nonexistent resource", () => {
    const scope = nock("https://somewhere")
      .put("/over/the/rainbow")
      .reply(404);

    return _put({
      client: client,
      path: "/over/the/rainbow",
      body: {}
    }).should.eventually.be.rejectedWith(ResponseError);
  });

  it("put resource with body and returns 200", () => {
    const scope = nock("https://somewhere")
      .put("/over/the")
      .reply(200);

    return _put({
      client: client,
      path: "/over/the",
      body: {}
    }).then(() => {
      expect(nock.isDone()).to.be.true;
    });
  });

  it("put resource with body and returns 204", () => {
    const scope = nock("https://somewhere")
      .put("/over/the")
      .reply(204);

    return _put({
      client: client,
      path: "/over/the",
      body: {}
    }).then(() => {
      expect(nock.isDone()).to.be.true;
    });
  });

  it("put resource with site id in query param, body and returns 201", () => {
    const scope = nock("https://somewhere")
      .put("/over")
      .query({ id: "the" })
      .reply(201);

    return _put({
      client: client,
      path: "/over",
      queryParameters: { id: "the" },
      body: { content: "rainbow" }
    }).then(() => {
      expect(nock.isDone()).to.be.true;
    });
  });
});

describe("base client patch test", () => {
  let client;

  beforeEach(() => {
    client = new BaseClient({ baseUri: "https://somewhere" });
  });
  afterEach(nock.cleanAll);

  it("patch resource and returns 200", () => {
    const scope = nock("https://somewhere")
      .patch("/over/the/rainbow")
      .reply(200);

    return _patch({ client: client, path: "/over/the/rainbow", body: {} }).then(
      () => {
        expect(nock.isDone()).to.be.true;
      }
    );
  });

  it("is not ok when attempting to patch nonexistent resource", () => {
    const scope = nock("https://somewhere")
      .patch("/over/the/rainbow")
      .reply(404);

    return _patch({
      client: client,
      path: "/over/the/rainbow",
      body: {}
    }).should.eventually.be.rejectedWith(ResponseError);
  });

  it("patch resource with body and returns 200", () => {
    const scope = nock("https://somewhere")
      .patch("/over/the")
      .reply(200);

    return _patch({
      client: client,
      path: "/over/the",
      body: {}
    }).then(() => {
      expect(nock.isDone()).to.be.true;
    });
  });

  it("patch resource with body and returns 204", () => {
    const scope = nock("https://somewhere")
      .patch("/over/the")
      .reply(204);

    return _patch({
      client: client,
      path: "/over/the",
      body: {}
    }).then(() => {
      expect(nock.isDone()).to.be.true;
    });
  });

  it("patch resource with site id in query param, body and returns 200", () => {
    const scope = nock("https://somewhere")
      .patch("/over")
      .query({ id: "the" })
      .reply(200);

    return _patch({
      client: client,
      path: "/over",
      queryParameters: { id: "the" },
      body: { content: "rainbow" }
    }).then(() => {
      expect(nock.isDone()).to.be.true;
    });
  });
});

describe("base client test with headers", () => {
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
      expect(nock.isDone()).to.be.true;
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
      expect(nock.isDone()).to.be.true;
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

    return _post({ client: client, path: "/over/the/rainbow", body: {} }).then(
      () => {
        expect(nock.isDone()).to.be.true;
      }
    );
  });

  it("cannot overwrite content-type for post", () => {
    const client = new BaseClient({
      baseUri: "https://somewhere",
      headers: CONTENT_TYPE_XML
    });
    const scope = nock("https://somewhere", { reqheaders: CONTENT_TYPE_JSON })
      .post("/over/the/rainbow")
      .reply(201, {});

    return _post({ client: client, path: "/over/the/rainbow", body: {} }).then(
      () => {
        expect(nock.isDone()).to.be.true;
      }
    );
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
      expect(nock.isDone()).to.be.true;
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
      expect(nock.isDone()).to.be.true;
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
      expect(nock.isDone()).to.be.true;
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
      expect(nock.isDone()).to.be.true;
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
      expect(nock.isDone()).to.be.true;
    });
  });
});
