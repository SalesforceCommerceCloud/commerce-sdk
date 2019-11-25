/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";

const fetchMock = require("fetch-mock").sandbox();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodeFetch = require("node-fetch");
nodeFetch.default = fetchMock;

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
} from "../src/base/static-client";

describe("base client get test", () => {
  afterEach(fetchMock.restore);

  it("makes correct call", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });
    fetchMock.get("*", { status: 200, body: { mock: "data" } });

    return _get({ client: client, path: "/over/the/rainbow" }).then(data => {
      expect(data).to.eql({ mock: "data" });
      expect(fetchMock.lastUrl()).to.equal(
        "https://somewhere/over/the/rainbow"
      );
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

    return _delete({
      client: client,
      path: "/over/the/rainbow"
    }).then(res => {
      expect(fetchMock.lastUrl()).to.be.equal(
        "https://somewhere/over/the/rainbow"
      );
    });
  });

  it("is not ok when attempting to delete nonexistent resource", () => {
    fetchMock.delete("*", 404);

    return _delete({
      client: client,
      path: "/over/the/rainbow"
    }).should.eventually.be.rejectedWith(ResponseError);
  });

  it("deletes resource with id and returns 200", () => {
    fetchMock.delete("*", 200);

    return _delete({
      client: client,
      path: "/over/the/{id}",
      pathParameters: { id: "rainbow" }
    }).then(res => {
      expect(fetchMock.lastUrl()).to.be.equal(
        "https://somewhere/over/the/rainbow"
      );
    });
  });

  it("deletes resource with id in query param and returns 200", () => {
    fetchMock.delete("*", 200);

    return _delete({
      client: client,
      path: "/over/the/",
      queryParameters: { id: "rainbow" }
    }).then(res => {
      expect(fetchMock.lastUrl()).to.be.equal(
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

    return _post({
      client: client,
      path: "/over/the/rainbow",
      body: {}
    }).then(res => {
      expect(fetchMock.lastUrl()).to.be.equal(
        "https://somewhere/over/the/rainbow"
      );
    });
  });

  it("is not ok when attempting to post nonexistent collection", () => {
    fetchMock.post("*", 404);

    return _post({
      client: client,
      path: "/over/the/rainbow",
      body: { location: "oz" }
    }).should.eventually.be.rejectedWith(ResponseError);
  });

  it("post resource with body and returns 201", () => {
    fetchMock.post("*", 201);

    return _post({
      client: client,
      path: "/over/the",
      body: { location: "oz" }
    }).then(res => {
      expect(fetchMock.lastUrl()).to.be.equal("https://somewhere/over/the");
    });
  });

  it("post resource with site id in query param, body and returns 201", () => {
    fetchMock.post("*", 201);

    return _post({
      client: client,
      path: "/over",
      queryParameters: { id: "the" },
      body: { content: "rainbow" }
    }).then(res => {
      expect(fetchMock.lastUrl()).to.be.equal("https://somewhere/over?id=the");
    });
  });
});

describe("base client put test", () => {
  let client;

  beforeEach(() => {
    client = new BaseClient({ baseUri: "https://somewhere" });
  });
  afterEach(fetchMock.restore);

  it("put resource and returns 201", () => {
    fetchMock.put("*", 201);

    return _put({ client: client, path: "/over/the/rainbow", body: {} }).then(
      () => {
        expect(fetchMock.lastUrl()).to.equal(
          "https://somewhere/over/the/rainbow"
        );
      }
    );
  });

  it("is not ok when attempting to put nonexistent resource", () => {
    fetchMock.put("*", 404);

    return _put({
      client: client,
      path: "/over/the/rainbow",
      body: {}
    }).should.eventually.be.rejectedWith(ResponseError);
  });

  it("put resource with body and returns 200", () => {
    fetchMock.put("*", 200);

    return _put({
      client: client,
      path: "/over/the",
      body: {}
    }).then(() => {
      expect(fetchMock.lastUrl()).to.equal("https://somewhere/over/the");
    });
  });

  it("put resource with body and returns 204", () => {
    fetchMock.put("*", 204);

    return _put({
      client: client,
      path: "/over/the",
      body: {}
    }).then(() => {
      expect(fetchMock.lastUrl()).to.equal("https://somewhere/over/the");
    });
  });

  it("put resource with site id in query param, body and returns 201", () => {
    fetchMock.put("*", 201);

    return _put({
      client: client,
      path: "/over",
      queryParameters: { id: "the" },
      body: { content: "rainbow" }
    }).then(() => {
      expect(fetchMock.lastUrl()).to.equal("https://somewhere/over?id=the");
    });
  });
});

describe("base client patch test", () => {
  let client;

  beforeEach(() => {
    client = new BaseClient({ baseUri: "https://somewhere" });
  });
  afterEach(fetchMock.restore);

  it("patch resource and returns 200", () => {
    fetchMock.patch("*", 200);

    return _patch({ client: client, path: "/over/the/rainbow", body: {} }).then(
      () => {
        expect(fetchMock.lastUrl()).to.equal(
          "https://somewhere/over/the/rainbow"
        );
      }
    );
  });

  it("is not ok when attempting to patch nonexistent resource", () => {
    fetchMock.patch("*", 404);

    return _patch({
      client: client,
      path: "/over/the/rainbow",
      body: {}
    }).should.eventually.be.rejectedWith(ResponseError);
  });

  it("patch resource with body and returns 200", () => {
    fetchMock.patch("*", 200);

    return _patch({
      client: client,
      path: "/over/the",
      body: {}
    }).then(() => {
      expect(fetchMock.lastUrl()).to.equal("https://somewhere/over/the");
    });
  });

  it("patch resource with body and returns 204", () => {
    fetchMock.patch("*", 204);

    return _patch({
      client: client,
      path: "/over/the",
      body: {}
    }).then(() => {
      expect(fetchMock.lastUrl()).to.equal("https://somewhere/over/the");
    });
  });

  it("patch resource with site id in query param, body and returns 200", () => {
    fetchMock.patch("*", 200);

    return _patch({
      client: client,
      path: "/over",
      queryParameters: { id: "the" },
      body: { content: "rainbow" }
    }).then(() => {
      expect(fetchMock.lastUrl()).to.equal("https://somewhere/over?id=the");
    });
  });
});

describe("base client test with headers", () => {
  afterEach(fetchMock.restore);

  const LANGUAGE_HEADER = { "Accept-Language": "en-US" };
  const TWO_HEADER = {
    "Accept-Language": "en-US",
    "Max-Forwards": "10"
  };
  const CONTENT_TYPE_XML = { "Content-Type": "text/xml" };

  it("makes correct get call with headers", () => {
    const client = new BaseClient({
      baseUri: "https://somewhere",
      headers: LANGUAGE_HEADER
    });
    fetchMock.get("*", { status: 200, body: { mock: "data" } });

    return _get({ client: client, path: "/over/the/rainbow" }).then(() => {
      expect(fetchMock.lastOptions().headers).to.eql(LANGUAGE_HEADER);
    });
  });

  it("makes correct call with two headers", () => {
    const client = new BaseClient({
      baseUri: "https://somewhere",
      headers: TWO_HEADER
    });
    fetchMock.get("*", { status: 200, body: { mock: "data" } });

    return _get({ client: client, path: "/over/the/rainbow" }).then(() => {
      expect(fetchMock.lastOptions().headers).to.eql(TWO_HEADER);
    });
  });

  it("makes correct call for post with two headers", () => {
    const client = new BaseClient({
      baseUri: "https://somewhere",
      headers: TWO_HEADER
    });
    fetchMock.post("*", { status: 201, body: {} });

    return _post({ client: client, path: "/over/the/rainbow", body: {} }).then(
      () => {
        expect(fetchMock.lastOptions().headers).to.include(TWO_HEADER);
      }
    );
  });

  it("cannot overwrite content-type for post", () => {
    const client = new BaseClient({
      baseUri: "https://somewhere",
      headers: CONTENT_TYPE_XML
    });
    fetchMock.post("*", { status: 201, body: {} });

    return _post({ client: client, path: "/over/the/rainbow", body: {} }).then(
      () => {
        expect(fetchMock.lastOptions().headers).to.not.include(
          CONTENT_TYPE_XML
        );
      }
    );
  });
});
