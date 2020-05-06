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
import {
  _delete,
  _get,
  _patch,
  _post,
  _put,
  ResponseError
} from "../../src/base/staticClient";

describe("Base Client requests", () => {
  describe("GET request", () => {
    afterEach(nock.cleanAll);

    it("makes correct call", () => {
      const client = new BaseClient({ baseUri: "https://somewhere" });
      const scope = nock("https://somewhere")
        .get("/over/the/rainbow")
        .reply(200, { mock: "data" });

      return _get({ client: client, path: "/over/the/rainbow" }).then(data => {
        expect(data).to.eql({ mock: "data" });
        expect(scope.isDone()).to.be.true;
      });
    });
  });

  describe("DELETE request", () => {
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
      }).then(() => {
        expect(scope.isDone()).to.be.true;
      });
    });

    it("is not ok when attempting to delete nonexistent resource", () => {
      nock("https://somewhere")
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
      }).then(() => {
        expect(scope.isDone()).to.be.true;
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
      }).then(() => {
        expect(scope.isDone()).to.be.true;
      });
    });
  });

  describe("POST request", () => {
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
      }).then(() => {
        expect(scope.isDone()).to.be.true;
      });
    });

    it("is not ok when attempting to post nonexistent collection", () => {
      nock("https://somewhere")
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
      }).then(() => {
        expect(scope.isDone()).to.be.true;
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
      }).then(() => {
        expect(scope.isDone()).to.be.true;
      });
    });
  });

  describe("PUT request", () => {
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
          expect(scope.isDone()).to.be.true;
        }
      );
    });

    it("is not ok when attempting to put nonexistent resource", () => {
      nock("https://somewhere")
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
        expect(scope.isDone()).to.be.true;
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
        expect(scope.isDone()).to.be.true;
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
        expect(scope.isDone()).to.be.true;
      });
    });
  });

  describe("PATCH request", () => {
    let client;

    beforeEach(() => {
      client = new BaseClient({ baseUri: "https://somewhere" });
    });
    afterEach(nock.cleanAll);

    it("patch resource and returns 200", () => {
      const scope = nock("https://somewhere")
        .patch("/over/the/rainbow")
        .reply(200);

      return _patch({
        client: client,
        path: "/over/the/rainbow",
        body: {}
      }).then(() => {
        expect(scope.isDone()).to.be.true;
      });
    });

    it("is not ok when attempting to patch nonexistent resource", () => {
      nock("https://somewhere")
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
        expect(scope.isDone()).to.be.true;
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
        expect(scope.isDone()).to.be.true;
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
        expect(scope.isDone()).to.be.true;
      });
    });
  });
});
