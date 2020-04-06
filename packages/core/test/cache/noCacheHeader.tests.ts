/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";
import chai from "chai";
import nock from "nock";

import { _get } from "../../src/base/staticClient";

export default function() {
  const expect = chai.expect;
  const RESPONSE_DATA = { mock: "data" };
  const RESPONSE_DATA_MODIFIED = { mock: "data_modified" };

  describe("base client cache-control response header (no-cache) tests", function() {
    afterEach(nock.cleanAll);

    it("asset not cached on response header no-cache", function() {
      const client = this.client;
      const scope = nock("https://somewhere")
        .get("/no-cache")
        .reply(200, RESPONSE_DATA, { "Cache-Control": "no-cache" });

      return _get({ client: client, path: "/no-cache" }).then(data => {
        expect(data).to.eql(RESPONSE_DATA);
        expect(nock.isDone()).to.be.true;
        scope
          .get("/no-cache")
          .reply(200, RESPONSE_DATA_MODIFIED, { "Cache-Control": "no-cache" });
        return _get({
          client: client,
          path: "/no-cache"
        }).then(data => {
          expect(data).to.eql(RESPONSE_DATA_MODIFIED);
          expect(nock.isDone()).to.be.true;
        });
      });
    });
  });

  describe("base client cache-control response header (no-store) tests", function() {
    afterEach(nock.cleanAll);

    it("asset not cached on response header no-store", function() {
      const client = this.client;
      const scope = nock("https://somewhere")
        .get("/no-store")
        .reply(200, RESPONSE_DATA, { "Cache-Control": "no-store" });

      return _get({ client: client, path: "/no-store" }).then(data => {
        expect(data).to.eql(RESPONSE_DATA);
        expect(nock.isDone()).to.be.true;
        scope
          .get("/no-store")
          .reply(200, RESPONSE_DATA_MODIFIED, { "Cache-Control": "no-store" });
        return _get({
          client: client,
          path: "/no-store"
        }).then(data => {
          expect(data).to.eql(RESPONSE_DATA_MODIFIED);
          expect(nock.isDone()).to.be.true;
        });
      });
    });
  });

  describe("base client Expires response header tests", function() {
    afterEach(nock.cleanAll);

    it("asset not cached on response header Expires with expired date", function() {
      const client = this.client;
      const scope = nock("https://somewhere")
        .get("/invalid-expires")
        .reply(200, RESPONSE_DATA, {
          Expires: "Wed, 18 Mar 2000 00:00:00 GMT"
        });

      return _get({ client: client, path: "/invalid-expires" }).then(data => {
        expect(data).to.eql(RESPONSE_DATA);
        expect(nock.isDone()).to.be.true;
        scope.get("/invalid-expires").reply(200, RESPONSE_DATA_MODIFIED);
        return _get({
          client: client,
          path: "/invalid-expires"
        }).then(data => {
          expect(data).to.eql(RESPONSE_DATA_MODIFIED);
          expect(nock.isDone()).to.be.true;
        });
      });
    });

    it("asset cached on response header Expires with future date", function() {
      const client = this.client;
      const scope = nock("https://somewhere")
        .get("/valid-expires")
        .reply(200, RESPONSE_DATA, {
          Expires: "Wed, 18 Mar 2050 00:00:00 GMT"
        });

      return _get({ client: client, path: "/valid-expires" }).then(data => {
        expect(data).to.eql(RESPONSE_DATA);
        expect(nock.isDone()).to.be.true;
        scope.get("/valid-expires").reply(200, RESPONSE_DATA_MODIFIED);
        return _get({
          client: client,
          path: "/valid-expires"
        }).then(data => {
          expect(data).to.eql(RESPONSE_DATA);
          expect(nock.isDone()).to.be.false;
        });
      });
    });

    it("asset not cached on response headers Expires and no-cache", function() {
      const client = this.client;
      const scope = nock("https://somewhere")
        .get("/valid-expires-with-no-cache")
        .reply(200, RESPONSE_DATA, {
          Expires: "Wed, 18 Mar 2050 00:00:00 GMT",
          "Cache-Control": "no-cache"
        });

      return _get({
        client: client,
        path: "/valid-expires-with-no-cache"
      }).then(data => {
        expect(data).to.eql(RESPONSE_DATA);
        expect(nock.isDone()).to.be.true;
        scope
          .get("/valid-expires-with-no-cache")
          .reply(200, RESPONSE_DATA_MODIFIED);
        return _get({
          client: client,
          path: "/valid-expires-with-no-cache"
        }).then(data => {
          expect(data).to.eql(RESPONSE_DATA_MODIFIED);
          expect(nock.isDone()).to.be.true;
        });
      });
    });

    it("asset not cached on response headers Expires and no-store", function() {
      const client = this.client;
      const scope = nock("https://somewhere")
        .get("/valid-expires-with-no-store")
        .reply(200, RESPONSE_DATA, {
          Expires: "Wed, 18 Mar 2050 00:00:00 GMT",
          "Cache-Control": "no-cache"
        });

      return _get({
        client: client,
        path: "/valid-expires-with-no-store"
      }).then(data => {
        expect(data).to.eql(RESPONSE_DATA);
        expect(nock.isDone()).to.be.true;
        scope
          .get("/valid-expires-with-no-store")
          .reply(200, RESPONSE_DATA_MODIFIED);
        return _get({
          client: client,
          path: "/valid-expires-with-no-store"
        }).then(data => {
          expect(data).to.eql(RESPONSE_DATA_MODIFIED);
          expect(nock.isDone()).to.be.true;
        });
      });
    });

    it("asset not cached on response headers Expires and invalid max-age", function() {
      const client = this.client;
      const scope = nock("https://somewhere")
        .get("/valid-expires-with-invalid-max-age")
        .reply(200, RESPONSE_DATA, {
          Expires: "Wed, 18 Mar 2050 00:00:00 GMT",
          "Cache-Control": "max-age=-1"
        });

      return _get({
        client: client,
        path: "/valid-expires-with-invalid-max-age"
      }).then(data => {
        expect(data).to.eql(RESPONSE_DATA);
        expect(nock.isDone()).to.be.true;
        scope
          .get("/valid-expires-with-invalid-max-age")
          .reply(200, RESPONSE_DATA_MODIFIED);
        return _get({
          client: client,
          path: "/valid-expires-with-invalid-max-age"
        }).then(data => {
          expect(data).to.eql(RESPONSE_DATA_MODIFIED);
          expect(nock.isDone()).to.be.true;
        });
      });
    });
  });

  describe("base client cache-control response header (max-age) tests", function() {
    afterEach(nock.cleanAll);

    it("asset not cached on response header invalid cache-control:max-age", function() {
      const client = this.client;
      const scope = nock("https://somewhere")
        .get("/invalid-max-age")
        .reply(200, RESPONSE_DATA, {
          "Cache-Control": "max-age=-1"
        });

      return _get({ client: client, path: "/invalid-max-age" }).then(data => {
        expect(data).to.eql(RESPONSE_DATA);
        expect(nock.isDone()).to.be.true;
        scope.get("/invalid-max-age").reply(200, RESPONSE_DATA_MODIFIED);
        return _get({
          client: client,
          path: "/invalid-max-age"
        }).then(data => {
          expect(data).to.eql(RESPONSE_DATA_MODIFIED);
          expect(nock.isDone()).to.be.true;
        });
      });
    });

    it("asset not cached on response header max-age=0", function() {
      const client = this.client;
      const scope = nock("https://somewhere")
        .get("/max-age-zero")
        .reply(200, RESPONSE_DATA, {
          "Cache-Control": "max-age=0"
        });

      return _get({ client: client, path: "/max-age-zero" }).then(data => {
        expect(data).to.eql(RESPONSE_DATA);
        expect(nock.isDone()).to.be.true;
        scope.get("/max-age-zero").reply(200, RESPONSE_DATA_MODIFIED);
        return _get({
          client: client,
          path: "/max-age-zero"
        }).then(data => {
          expect(data).to.eql(RESPONSE_DATA_MODIFIED);
          expect(nock.isDone()).to.be.true;
        });
      });
    });

    it("asset cached on response header max-age=10000000", function() {
      const client = this.client;
      const scope = nock("https://somewhere")
        .get("/max-age-10000000")
        .reply(200, RESPONSE_DATA, {
          "Cache-Control": "max-age=10000000"
        });

      return _get({ client: client, path: "/max-age-10000000" }).then(data => {
        expect(data).to.eql(RESPONSE_DATA);
        expect(nock.isDone()).to.be.true;
        scope.get("/max-age-10000000").reply(200, RESPONSE_DATA_MODIFIED);
        return _get({
          client: client,
          path: "/max-age-10000000"
        }).then(data => {
          expect(data).to.eql(RESPONSE_DATA);
          expect(nock.isDone()).to.be.false;
        });
      });
    });

    it("asset not cached on response header max-age=10000000 and no-cache", function() {
      const client = this.client;
      const scope = nock("https://somewhere")
        .get("/max-age-10000000-and-no-cache")
        .reply(200, RESPONSE_DATA, {
          "Cache-Control": "max-age=10000000, no-cache "
        });

      return _get({
        client: client,
        path: "/max-age-10000000-and-no-cache"
      }).then(data => {
        expect(data).to.eql(RESPONSE_DATA);
        expect(nock.isDone()).to.be.true;
        scope
          .get("/max-age-10000000-and-no-cache")
          .reply(200, RESPONSE_DATA_MODIFIED);
        return _get({
          client: client,
          path: "/max-age-10000000-and-no-cache"
        }).then(data => {
          expect(data).to.eql(RESPONSE_DATA_MODIFIED);
          expect(nock.isDone()).to.be.true;
        });
      });
    });

    it("asset not cached on response header max-age=10000000 and no-store", function() {
      const client = this.client;
      const scope = nock("https://somewhere")
        .get("/max-age-10000000-and-no-store")
        .reply(200, RESPONSE_DATA, {
          "Cache-Control": "max-age=10000000, no-store"
        });

      return _get({
        client: client,
        path: "/max-age-10000000-and-no-store"
      }).then(data => {
        expect(data).to.eql(RESPONSE_DATA);
        expect(nock.isDone()).to.be.true;
        scope
          .get("/max-age-10000000-and-no-store")
          .reply(200, RESPONSE_DATA_MODIFIED);
        return _get({
          client: client,
          path: "/max-age-10000000-and-no-store"
        }).then(data => {
          expect(data).to.eql(RESPONSE_DATA_MODIFIED);
          expect(nock.isDone()).to.be.true;
        });
      });
    });
  });
}
