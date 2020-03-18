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
import { _get } from "../src/base/staticClient";

const RESPONSE_DATA = { mock: "data" };
const RESPONSE_DATA_MODIFIED = { mock: "data_modified" };

describe("base client multiple cache-control directives tests", () => {
  afterEach(nock.cleanAll);

  it("asset not cached on response headers no-cache, no-store and valid max-age", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });
    const scope = nock("https://somewhere")
      .get("/fetch-fresh")
      .reply(200, RESPONSE_DATA, {
        "Cache-Control": "no-cache, no-store, max-age=100000"
      });

    return _get({ client: client, path: "/fetch-fresh" }).then(data => {
      expect(data).to.eql(RESPONSE_DATA);
      expect(nock.isDone()).to.be.true;
      scope
        .get("/fetch-fresh")
        .reply(200, RESPONSE_DATA_MODIFIED, { "Cache-Control": "no-cache" });
      return _get({
        client: client,
        path: "/fetch-fresh"
      }).then(data => {
        expect(data).to.eql(RESPONSE_DATA_MODIFIED);
        expect(nock.isDone()).to.be.true;
      });
    });
  });

  it("asset not cached on response headers no-cache, no-store and valid max-age, etag", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });
    const scope = nock("https://somewhere")
      .get("/fetch-fresh")
      .reply(200, RESPONSE_DATA, {
        "Cache-Control": "no-cache, no-store, max-age=100000",
        Etag: "etag"
      });

    return _get({ client: client, path: "/fetch-fresh" }).then(data => {
      expect(data).to.eql(RESPONSE_DATA);
      expect(nock.isDone()).to.be.true;
      scope.get("/fetch-fresh").reply(
        200,
        function() {
          expect(this.req.headers["if-none-match"]).to.be.undefined;
          return RESPONSE_DATA_MODIFIED;
        },
        {}
      );

      return _get({
        client: client,
        path: "/fetch-fresh"
      }).then(data => {
        expect(data).to.eql(RESPONSE_DATA_MODIFIED);
        expect(nock.isDone()).to.be.true;
      });
    });
  });

  it("asset not cached on response headers no-cache, no-store and valid Expires, etag", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });
    const scope = nock("https://somewhere")
      .get("/fetch-fresh")
      .reply(200, RESPONSE_DATA, {
        "Cache-Control": "no-cache, no-store",
        Expires: "Wed, 18 Mar 2050 00:00:00 GMT",
        "Last-Modified": "Wed, 18 Mar 2000 00:00:00 GMT",
        Etag: "etag"
      });

    return _get({ client: client, path: "/fetch-fresh" }).then(data => {
      expect(data).to.eql(RESPONSE_DATA);
      expect(nock.isDone()).to.be.true;
      scope.get("/fetch-fresh").reply(
        200,
        function() {
          expect(this.req.headers["if-none-match"]).to.be.undefined;
          expect(this.req.headers["if-modified-since"]).to.be.undefined;
          return RESPONSE_DATA_MODIFIED;
        },
        {}
      );

      return _get({
        client: client,
        path: "/fetch-fresh"
      }).then(data => {
        expect(data).to.eql(RESPONSE_DATA_MODIFIED);
        expect(nock.isDone()).to.be.true;
      });
    });
  });
});

describe("base client respect max-age cache-control directive tests", () => {
  afterEach(nock.cleanAll);

  it("asset cached on response headers max-age=1000000 with etag", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });
    const scope = nock("https://somewhere")
      .get("/fetch-cached")
      .reply(200, RESPONSE_DATA, {
        "Cache-Control": "max-age=100000",
        EtAg: "etag"
      });

    return _get({ client: client, path: "/fetch-cached" }).then(data => {
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
      return _get({
        client: client,
        path: "/fetch-cached"
      }).then(data => {
        expect(data).to.eql(RESPONSE_DATA);
        expect(nock.isDone()).to.be.false;
      });
    });
  });

  it("asset re-validated on response headers max-age=0 with etag", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });
    const scope = nock("https://somewhere")
      .get("/fetch-cached-with-max-age-0")
      .reply(200, RESPONSE_DATA, {
        "Cache-Control": "max-age=0",
        EtAg: "etag"
      });

    return _get({ client: client, path: "/fetch-cached-with-max-age-0" }).then(
      data => {
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
        return _get({
          client: client,
          path: "/fetch-cached-with-max-age-0"
        }).then(data => {
          expect(data).to.eql(RESPONSE_DATA);
          expect(nock.isDone()).to.be.true;
        });
      }
    );
  });

  it("asset re-validated on response headers no-cache with etag", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });
    const scope = nock("https://somewhere")
      .get("/fetch-cached-with-no-cache")
      .reply(200, RESPONSE_DATA, {
        "Cache-Control": "no-cache, max-age=10000000",
        EtAg: "EtAg"
      });

    return _get({ client: client, path: "/fetch-cached-with-no-cache" }).then(
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
        return _get({
          client: client,
          path: "/fetch-cached-with-no-cache"
        }).then(data => {
          expect(data).to.eql(RESPONSE_DATA);
          expect(nock.isDone()).to.be.true;
        });
      }
    );
  });

  it("asset not cached on response headers no-store with etag", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });
    const scope = nock("https://somewhere")
      .get("/fetch-cached-with-no-store")
      .reply(200, RESPONSE_DATA, {
        "Cache-Control": "no-store, max-age=1000000",
        EtAg: "EtAg"
      });

    return _get({ client: client, path: "/fetch-cached-with-no-store" }).then(
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
        return _get({
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

describe("base client respect Expires cache-control directive tests", () => {
  afterEach(nock.cleanAll);

  it("asset cached on response headers max-age=1000000, etag and past Expiry", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });
    const scope = nock("https://somewhere")
      .get("/fetch-fresh-invalid-expiry")
      .reply(200, RESPONSE_DATA, {
        "Cache-Control": "max-age=100000",
        Expires: "Wed, 18 Mar 2010 00:00:00 GMT",
        "Last-Modified": "Wed, 18 Mar 2010 00:00:00 GMT",
        EtAg: "etag"
      });

    return _get({ client: client, path: "/fetch-fresh-invalid-expiry" }).then(
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
        return _get({
          client: client,
          path: "/fetch-fresh-invalid-expiry"
        }).then(data => {
          expect(data).to.eql(RESPONSE_DATA);
          expect(nock.isDone()).to.be.false;
        });
      }
    );
  });

  it("asset cached on response headers no-cache, etag and past Expiry", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });
    const scope = nock("https://somewhere")
      .get("/fetch-fresh-past-expiry")
      .reply(200, RESPONSE_DATA, {
        "Cache-Control": "no-cache",
        Expires: "Wed, 18 Mar 2000 00:00:00 GMT",
        "Last-Modified": "Wed, 18 Mar 2000 00:00:00 GMT",
        EtaG: "EtaG"
      });

    return _get({ client: client, path: "/fetch-fresh-past-expiry" }).then(
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
        return _get({
          client: client,
          path: "/fetch-fresh-past-expiry"
        }).then(data => {
          expect(data).to.eql(RESPONSE_DATA_MODIFIED);
          expect(nock.isDone()).to.be.true;
        });
      }
    );
  });

  it("asset cached on response headers etag and past Expiry", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });
    const scope = nock("https://somewhere")
      .get("/fetch-fresh-past-expiry")
      .reply(200, RESPONSE_DATA, {
        Expires: "Wed, 18 Mar 2000 00:00:00 GMT",
        "Last-Modified": "Wed, 18 Mar 2000 00:00:00 GMT",
        EtaG: "EtaG"
      });

    return _get({ client: client, path: "/fetch-fresh-past-expiry" }).then(
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
        return _get({
          client: client,
          path: "/fetch-fresh-past-expiry"
        }).then(data => {
          expect(data).to.eql(RESPONSE_DATA_MODIFIED);
          expect(nock.isDone()).to.be.true;
        });
      }
    );
  });
});
