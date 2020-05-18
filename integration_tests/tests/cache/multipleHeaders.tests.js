/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";

const chai = require("chai");
const nock = require("nock");

const { StaticClient }= require("@commerce-apps/core");

module.exports = function() {
  const expect = chai.expect;

  const RESPONSE_DATA = { mock: "data" };
  const RESPONSE_DATA_MODIFIED = { mock: "data_modified" };

  describe("base client multiple cache-control directives tests", function() {
    afterEach(nock.cleanAll);

    it("asset not cached on response headers no-cache, no-store and valid max-age", function() {
      const client = this.client;
      const scope = nock("https://somewhere")
        .get("/fetch-fresh-no-etag")
        .reply(200, RESPONSE_DATA, {
          "Cache-Control": "no-cache, no-store, max-age=100000"
        });

      return StaticClient.get({ client: client, path: "/fetch-fresh-no-etag" }).then(
        data => {
          expect(data).to.eql(RESPONSE_DATA);
          expect(nock.isDone()).to.be.true;
          scope.get("/fetch-fresh-no-etag").reply(200, RESPONSE_DATA_MODIFIED, {
            "Cache-Control": "no-cache"
          });
          return StaticClient.get({
            client: client,
            path: "/fetch-fresh-no-etag"
          }).then(data => {
            expect(data).to.eql(RESPONSE_DATA_MODIFIED);
            expect(nock.isDone()).to.be.true;
          });
        }
      );
    });

    it("asset not cached on response headers no-cache, no-store and valid max-age, etag", function() {
      const client = this.client;
      const scope = nock("https://somewhere")
        .get("/fetch-fresh-with-etag")
        .reply(200, RESPONSE_DATA, {
          "Cache-Control": "no-cache, no-store, max-age=100000",
          Etag: "etag"
        });

      return StaticClient.get({ client: client, path: "/fetch-fresh-with-etag" }).then(
        data => {
          expect(data).to.eql(RESPONSE_DATA);
          expect(nock.isDone()).to.be.true;
          scope.get("/fetch-fresh-with-etag").reply(
            200,
            function() {
              expect(this.req.headers["if-none-match"]).to.be.undefined;
              return RESPONSE_DATA_MODIFIED;
            },
            {}
          );

          return StaticClient.get({
            client: client,
            path: "/fetch-fresh-with-etag"
          }).then(data => {
            expect(data).to.eql(RESPONSE_DATA_MODIFIED);
            expect(nock.isDone()).to.be.true;
          });
        }
      );
    });

    it("asset not cached on response headers no-cache, no-store and valid Expires, etag", function() {
      const client = this.client;
      const scope = nock("https://somewhere")
        .get("/fetch-fresh-with-expires")
        .reply(200, RESPONSE_DATA, {
          "Cache-Control": "no-cache, no-store",
          Expires: "Wed, 18 Mar 2050 00:00:00 GMT",
          "Last-Modified": "Wed, 18 Mar 2000 00:00:00 GMT",
          Etag: "etag"
        });

      return StaticClient.get({ client: client, path: "/fetch-fresh-with-expires" }).then(
        data => {
          expect(data).to.eql(RESPONSE_DATA);
          expect(nock.isDone()).to.be.true;
          scope.get("/fetch-fresh-with-expires").reply(
            200,
            function() {
              expect(this.req.headers["if-none-match"]).to.be.undefined;
              expect(this.req.headers["if-modified-since"]).to.be.undefined;
              return RESPONSE_DATA_MODIFIED;
            },
            {}
          );

          return StaticClient.get({
            client: client,
            path: "/fetch-fresh-with-expires"
          }).then(data => {
            expect(data).to.eql(RESPONSE_DATA_MODIFIED);
            expect(nock.isDone()).to.be.true;
          });
        }
      );
    });
  });

  describe("base client respect max-age cache-control directive tests", function() {
    afterEach(nock.cleanAll);

    it("asset cached on response headers max-age=1000000 with etag", function() {
      const client = this.client;
      const scope = nock("https://somewhere")
        .get("/fetch-cached")
        .reply(200, RESPONSE_DATA, {
          "Cache-Control": "max-age=100000",
          EtAg: "etag"
        });

      return StaticClient.get({ client: client, path: "/fetch-cached" }).then(data => {
        expect(data).to.eql(RESPONSE_DATA);
        expect(nock.isDone()).to.be.true;
        // this nock is never called
        scope.get("/fetch-cached").reply(
          304,
          function() {
            expect(this.req.headers["if-none-match"]).to.be.undefined;
            return undefined;
          },
          {}
        );
        return StaticClient.get({
          client: client,
          path: "/fetch-cached"
        }).then(data => {
          expect(data).to.eql(RESPONSE_DATA);
          expect(nock.isDone()).to.be.false;
        });
      });
    });

    it("asset re-validated on response headers max-age=0 with etag", function() {
      const client = this.client;
      const scope = nock("https://somewhere")
        .get("/fetch-cached-with-max-age-0")
        .reply(200, RESPONSE_DATA, {
          "Cache-Control": "max-age=0",
          EtAg: "etag"
        });

      return StaticClient.get({
        client: client,
        path: "/fetch-cached-with-max-age-0"
      }).then(data => {
        expect(data).to.eql(RESPONSE_DATA);
        expect(nock.isDone()).to.be.true;
        scope.get("/fetch-cached-with-max-age-0").reply(
          304,
          function() {
            expect(this.req.headers["if-none-match"][0]).to.eql("etag");
            return undefined;
          },
          {}
        );
        return StaticClient.get({
          client: client,
          path: "/fetch-cached-with-max-age-0"
        }).then(data => {
          expect(data).to.eql(RESPONSE_DATA);
          expect(nock.isDone()).to.be.true;
        });
      });
    });

    it("asset re-validated on response headers no-cache with etag", function() {
      const client = this.client;
      const scope = nock("https://somewhere")
        .get("/fetch-cached-with-no-cache")
        .reply(200, RESPONSE_DATA, {
          "Cache-Control": "no-cache, max-age=10000000",
          EtAg: "EtAg"
        });

      return StaticClient.get({ client: client, path: "/fetch-cached-with-no-cache" }).then(
        data => {
          expect(data).to.eql(RESPONSE_DATA);
          expect(nock.isDone()).to.be.true;
          scope.get("/fetch-cached-with-no-cache").reply(
            304,
            function() {
              expect(this.req.headers["if-none-match"][0]).to.eql("EtAg");
              return undefined;
            },
            {}
          );
          return StaticClient.get({
            client: client,
            path: "/fetch-cached-with-no-cache"
          }).then(data => {
            expect(data).to.eql(RESPONSE_DATA);
            expect(nock.isDone()).to.be.true;
          });
        }
      );
    });

    it("asset not cached on response headers no-store with etag", function() {
      const client = this.client;
      const scope = nock("https://somewhere")
        .get("/fetch-cached-with-no-store")
        .reply(200, RESPONSE_DATA, {
          "Cache-Control": "no-store, max-age=1000000",
          EtAg: "EtAg"
        });

      return StaticClient.get({ client: client, path: "/fetch-cached-with-no-store" }).then(
        data => {
          expect(data).to.eql(RESPONSE_DATA);
          expect(nock.isDone()).to.be.true;
          scope.get("/fetch-cached-with-no-store").reply(
            200,
            function() {
              expect(this.req.headers["if-none-match"]).to.be.undefined;
              return RESPONSE_DATA_MODIFIED;
            },
            {}
          );
          return StaticClient.get({
            client: client,
            path: "/fetch-cached-with-no-store"
          }).then(data => {
            expect(data).to.eql(RESPONSE_DATA_MODIFIED);
            expect(nock.isDone()).to.be.true;
          });
        }
      );
    });
  });

  describe("base client respect Expires cache-control directive tests", function() {
    afterEach(nock.cleanAll);

    it("asset cached on response headers max-age=1000000, etag and past Expiry", function() {
      const client = this.client;
      const scope = nock("https://somewhere")
        .get("/fetch-fresh-invalid-expiry")
        .reply(200, RESPONSE_DATA, {
          "Cache-Control": "max-age=100000",
          Expires: "Wed, 18 Mar 2010 00:00:00 GMT",
          "Last-Modified": "Wed, 18 Mar 2010 00:00:00 GMT",
          EtAg: "etag"
        });

      return StaticClient.get({ client: client, path: "/fetch-fresh-invalid-expiry" }).then(
        data => {
          expect(data).to.eql(RESPONSE_DATA);
          expect(nock.isDone()).to.be.true;
          // this nock is never called
          scope.get("/fetch-fresh-invalid-expiry").reply(
            200,
            function() {
              expect(this.req.headers["if-none-match"]).to.eql("etag");
              return RESPONSE_DATA_MODIFIED;
            },
            {}
          );
          return StaticClient.get({
            client: client,
            path: "/fetch-fresh-invalid-expiry"
          }).then(data => {
            expect(data).to.eql(RESPONSE_DATA);
            expect(nock.isDone()).to.be.false;
          });
        }
      );
    });

    it("asset cached on response headers no-cache, etag and past Expiry", function() {
      const client = this.client;
      const scope = nock("https://somewhere")
        .get("/fetch-fresh-past-expiry")
        .reply(200, RESPONSE_DATA, {
          "Cache-Control": "no-cache",
          Expires: "Wed, 18 Mar 2000 00:00:00 GMT",
          "Last-Modified": "Wed, 18 Mar 2000 00:00:00 GMT",
          EtaG: "EtaG"
        });

      return StaticClient.get({ client: client, path: "/fetch-fresh-past-expiry" }).then(
        data => {
          expect(data).to.eql(RESPONSE_DATA);
          expect(nock.isDone()).to.be.true;
          scope.get("/fetch-fresh-past-expiry").reply(
            200,
            function() {
              expect(this.req.headers["if-none-match"][0]).to.eql("EtaG");
              expect(this.req.headers["if-modified-since"][0]).to.eql(
                "Wed, 18 Mar 2000 00:00:00 GMT"
              );
              return RESPONSE_DATA_MODIFIED;
            },
            {}
          );
          return StaticClient.get({
            client: client,
            path: "/fetch-fresh-past-expiry"
          }).then(data => {
            expect(data).to.eql(RESPONSE_DATA_MODIFIED);
            expect(nock.isDone()).to.be.true;
          });
        }
      );
    });

    it("asset cached on response headers etag and past Expiry", function() {
      const client = this.client;
      const scope = nock("https://somewhere")
        .get("/fetch-fresh-past-expiry-no-cache")
        .reply(200, RESPONSE_DATA, {
          Expires: "Wed, 18 Mar 2000 00:00:00 GMT",
          "Last-Modified": "Wed, 18 Mar 2000 00:00:00 GMT",
          EtaG: "EtaG"
        });

      return StaticClient.get({
        client: client,
        path: "/fetch-fresh-past-expiry-no-cache"
      }).then(data => {
        expect(data).to.eql(RESPONSE_DATA);
        expect(nock.isDone()).to.be.true;
        scope.get("/fetch-fresh-past-expiry-no-cache").reply(
          200,
          function() {
            expect(this.req.headers["if-none-match"][0]).to.eql("EtaG");
            expect(this.req.headers["if-modified-since"][0]).to.eql(
              "Wed, 18 Mar 2000 00:00:00 GMT"
            );
            return RESPONSE_DATA_MODIFIED;
          },
          {}
        );
        return StaticClient.get({
          client: client,
          path: "/fetch-fresh-past-expiry-no-cache"
        }).then(data => {
          expect(data).to.eql(RESPONSE_DATA_MODIFIED);
          expect(nock.isDone()).to.be.true;
        });
      });
    });
  });
}
