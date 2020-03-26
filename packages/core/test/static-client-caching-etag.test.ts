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

import { BaseClient } from "../src/base/client";
import { CacheManagerKeyv } from "../src/base/cacheManagerKeyv";
import { _delete, _get, _patch, _post, _put } from "../src/base/staticClient";

const expect = chai.expect;

let client;

before(() => {
  chai.should();
  chai.use(chaiAsPromised);

  client = new BaseClient({ baseUri: "https://somewhere" });
});

beforeEach(() => client.clientConfig.cacheManager?.keyv?.clear());

describe("base client etag based conditional get tests", () => {
  afterEach(nock.cleanAll);

  it("sdk adds if-none-match header and returns cached content on 304 response", () => {
    const scope = nock("https://somewhere")
      .get("/unmodified")
      .reply(200, { mock: "data" }, { ETag: "etag" });

    // make first request and get response from server
    return _get({
      client: client,
      path: "/unmodified"
    }).then(data => {
      //ensure response body is correct from server
      expect(data).to.eql({ mock: "data" });
      //ensure all http calls are done
      expect(nock.isDone()).to.be.true;

      scope.get("/unmodified").reply(304, function() {
        //verify if sdk adds if-none-match header
        expect(this.req.headers["if-none-match"][0]).to.eql("etag");
      });

      return _get({
        client: client,
        path: "/unmodified"
      }).then(data => {
        //ensure content is not empty and equals to the cached content
        expect(data).to.eql({ mock: "data" });
        expect(nock.isDone()).to.be.true;
      });
    });
  });

  it("sdk adds if-none-match header and returns cached content with max age on 304 response", () => {
    const scope = nock("https://somewhere")
      .get("/unmodified")
      .reply(200, { mock: "data" }, { ETag: "etag", "max-age": "100000000" });

    // make first request and get response from server
    return _get({
      client: client,
      path: "/unmodified"
    }).then(data => {
      //ensure response body is correct from server
      expect(data).to.eql({ mock: "data" });
      //ensure all http calls are done
      expect(nock.isDone()).to.be.true;

      scope.get("/unmodified").reply(304, function() {
        //verify if sdk adds if-none-match header
        expect(this.req.headers["if-none-match"][0]).to.eql("etag");
      });

      return _get({
        client: client,
        path: "/unmodified"
      }).then(data => {
        //ensure content is not empty and equals to the cached content
        expect(data).to.eql({ mock: "data" });
        expect(nock.isDone()).to.be.true;
      });
    });
  });

  it("sdk adds if-none-match header and returns modified content on 200 response", () => {
    const scope = nock("https://somewhere")
      .get("/modified")
      .reply(200, { mock: "data" }, { ETag: "etag" });

    // make first request and get response from server
    return _get({
      client: client,
      path: "/modified"
    }).then(data => {
      //ensure response body is correct from server
      expect(data).to.eql({ mock: "data" });
      //ensure all http calls are done
      expect(nock.isDone()).to.be.true;

      scope.get("/modified").reply(
        200,
        function() {
          expect(this.req.headers["if-none-match"][0]).to.eql("etag");
          return { mock: "data_modified" };
        },
        { ETag: "new etag" }
      );

      return _get({
        client: client,
        path: "/modified"
      }).then(data => {
        //ensure content is not empty and equals to the modified content
        expect(data).to.eql({ mock: "data_modified" });
        expect(nock.isDone()).to.be.true;
      });
    });
  });

  it("sdk does not add if-none-match header and returns cached content without etag on 200 response", () => {
    const scope = nock("https://somewhere")
      .get("/cached")
      .reply(200, { mock: "data" }, { "Cache-Control": "max-age=100000000" });

    // make first request and get response from server
    return _get({
      client: client,
      path: "/cached"
    }).then(data => {
      //ensure response body is correct from server
      expect(data).to.eql({ mock: "data" });
      //ensure all http calls are done
      expect(nock.isDone()).to.be.true;

      //This mock never called
      scope.get("/cached").reply(
        200,
        function() {
          expect(this.req.headers["if-none-match"]).to.be.null;
          return { mock: "data_modified" };
        },
        { "Cache-Control": "max-age=100000000" }
      );

      return _get({
        client: client,
        path: "/cached"
      }).then(data => {
        //ensure content is not empty and equals to the cached content
        expect(data).to.eql({ mock: "data" });
        // Nock is not done as one of the mock is never called
        expect(nock.isDone()).to.be.false;
      });
    });
  });

  it("sdk adds if-none-match header with updated etag on 200 response", () => {
    const scope = nock("https://somewhere")
      .get("/modified")
      .reply(200, { mock: "data" }, { ETag: "etag" });

    // make first request and get response from server
    return _get({
      client: client,
      path: "/modified"
    }).then(data => {
      //ensure response body is correct from server
      expect(data).to.eql({ mock: "data" });
      //ensure all http calls are done
      expect(nock.isDone()).to.be.true;

      scope.get("/modified").reply(
        304,
        function() {
          expect(this.req.headers["if-none-match"][0]).to.eql("etag");
        },
        { ETag: "new etag" }
      );

      return _get({
        client: client,
        path: "/modified"
      }).then(data => {
        //ensure content is not empty and equals to the cached content
        expect(data).to.eql({ mock: "data" });
        expect(nock.isDone()).to.be.true;
        scope.get("/modified").reply(
          304,
          function() {
            expect(this.req.headers["if-none-match"][0]).to.eql("new etag");
          },
          { ETag: "new etag" }
        );
        return _get({
          client: client,
          path: "/modified"
        }).then(data => {
          //ensure content is not empty and equals to the cached content
          expect(data).to.eql({ mock: "data" });
          expect(nock.isDone()).to.be.true;
        });
      });
    });
  });
});

describe("base client last-modified based conditional get tests", () => {
  afterEach(nock.cleanAll);

  it("sdk adds if-modified-since header and returns cached content on 304 response", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const dateLastModified = new Date(new Date() - 10000000).toUTCString();
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const dateExpires = new Date(new Date() + 10000000).toUTCString();
    const scope = nock("https://somewhere")
      .get("/lastmodified")
      .reply(
        200,
        { mock: "data" },
        {
          "Last-Modified": dateLastModified,
          Expires: dateExpires
        }
      );

    // make first request and get response from server
    return _get({
      client: client,
      path: "/lastmodified"
    }).then(data => {
      //ensure response body is correct from server
      expect(data).to.eql({ mock: "data" });
      //ensure all http calls are done
      expect(nock.isDone()).to.be.true;

      scope.get("/lastmodified").reply(304, function() {
        expect(this.req.headers["if-modified-since"][0]).to.eql(
          dateLastModified
        );
      });

      return _get({
        client: client,
        path: "/lastmodified"
      }).then(data => {
        //ensure content is not empty and equals to the cached content
        expect(data).to.eql({ mock: "data" });
        expect(nock.isDone()).to.be.true;
      });
    });
  });

  it("sdk adds if-modified-since header and returns modified content on 200 response", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const dateLastModified = new Date(new Date() - 10000000).toUTCString();
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const dateExpires = new Date(new Date() + 10000000).toUTCString();
    const scope = nock("https://somewhere")
      .get("/lastmodified")
      .reply(
        200,
        { mock: "data" },
        {
          "Last-Modified": dateLastModified,
          Expires: dateExpires
        }
      );

    // make first request and get response from server
    return _get({
      client: client,
      path: "/lastmodified"
    }).then(data => {
      //ensure response body is correct from server
      expect(data).to.eql({ mock: "data" });
      //ensure all http calls are done
      expect(nock.isDone()).to.be.true;

      scope.get("/lastmodified").reply(200, function() {
        expect(this.req.headers["if-modified-since"][0]).to.eql(
          dateLastModified
        );
        return { mock: "data_modified" };
      });

      return _get({
        client: client,
        path: "/lastmodified"
      }).then(data => {
        //ensure content is not empty and equals to the modified content
        expect(data).to.eql({ mock: "data_modified" });
        expect(nock.isDone()).to.be.true;
      });
    });
  });

  it("sdk does not add if-modified-since header and returns cached content on 200 response", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const dateExpires = new Date(new Date() + 10000000).toUTCString();
    const scope = nock("https://somewhere")
      .get("/lastmodified")
      .reply(
        200,
        { mock: "data" },
        {
          Expires: dateExpires
        }
      );

    // make first request and get response from server
    return _get({
      client: client,
      path: "/lastmodified"
    }).then(data => {
      //ensure response body is correct from server
      expect(data).to.eql({ mock: "data" });
      //ensure all http calls are done
      expect(nock.isDone()).to.be.true;

      // This mock is never called
      scope.get("/lastmodified").reply(200, function() {
        expect(this.req.headers["if-modified-since"]).to.null;
        return { mock: "data_modified" };
      });

      return _get({
        client: client,
        path: "/lastmodified"
      }).then(data => {
        //ensure content is not empty and equals to the cached content
        expect(data).to.eql({ mock: "data" });
        // Nock is not as one http request is declared and not called
        expect(nock.isDone()).to.be.false;
      });
    });
  });

  it("sdk adds updated if-modified-since header on 304 response", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const lastModified = new Date(new Date() - 20000000).toUTCString();

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const newLastModified = new Date(new Date() - 10000000).toUTCString();

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const dateExpires = new Date(new Date() + 10000000).toUTCString();
    const scope = nock("https://somewhere")
      .get("/lastmodified")
      .reply(
        200,
        { mock: "data" },
        {
          "Last-Modified": lastModified,
          Expires: dateExpires
        }
      );

    // make first request and get response from server
    return _get({
      client: client,
      path: "/lastmodified"
    }).then(data => {
      //ensure response body is correct from server
      expect(data).to.eql({ mock: "data" });
      //ensure all http calls are done
      expect(nock.isDone()).to.be.true;

      scope.get("/lastmodified").reply(
        304,
        function() {
          expect(this.req.headers["if-modified-since"][0]).to.eql(lastModified);
        },
        { "Last-Modified": newLastModified, Expires: dateExpires }
      );

      return _get({
        client: client,
        path: "/lastmodified"
      }).then(data => {
        //ensure content is not empty and equals to the cached content
        expect(data).to.eql({ mock: "data" });
        expect(nock.isDone()).to.be.true;
        scope.get("/lastmodified").reply(304, function() {
          expect(this.req.headers["if-modified-since"][0]).to.eql(
            newLastModified
          );
        });
        return _get({
          client: client,
          path: "/lastmodified"
        }).then(data => {
          //ensure content is not empty and equals to the cached content
          expect(data).to.eql({ mock: "data" });
          expect(nock.isDone()).to.be.true;
        });
      });
    });
  });

  it("sdk does not add if-modified-since header on cached content w/o Expires header", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const dateLastModified = new Date(new Date() - 10000000).toUTCString();
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const dateExpires = new Date(new Date() + 10000000).toUTCString();
    const scope = nock("https://somewhere")
      .get("/lastmodified")
      .reply(
        200,
        { mock: "data" },
        {
          "Last-Modified": dateLastModified,
          "Cache-Control": "max-age=100000000"
        }
      );

    // make first request and get response from server
    return _get({
      client: client,
      path: "/lastmodified"
    }).then(data => {
      //ensure response body is correct from server
      expect(data).to.eql({ mock: "data" });
      //ensure all http calls are done
      expect(nock.isDone()).to.be.true;

      //this nock is never called as the cached content is missing expires header
      scope.get("/lastmodified").reply(304, function() {
        expect(this.req.headers["if-modified-since"]).to.be.null;
      });

      return _get({
        client: client,
        path: "/lastmodified"
      }).then(data => {
        //ensure content is not empty and equals to the cached content
        expect(data).to.eql({ mock: "data" });
        expect(nock.isDone()).to.be.false;
      });
    });
  });
});
