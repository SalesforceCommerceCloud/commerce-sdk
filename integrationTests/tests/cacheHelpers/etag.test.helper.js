/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";

const chai = require("chai");
const nock = require("nock");

const { StaticClient } = require("@commerce-apps/core");
/**
 * Etag tests to verify conditional retrievals
 * for Salesforce Commerce SDK cache manager interface.
 */
module.exports = function() {
  const expect = chai.expect;

  describe("base client etag based conditional get tests", function() {
    afterEach(nock.cleanAll);

    it("sdk adds if-none-match header and returns modified content on 200 response", function() {
      const scope = nock("https://somewhere")
        .get("/modified")
        .reply(200, { mock: "data" }, { ETag: "etag" });

      // make first request and get response from server
      return StaticClient.get({
        client: this.client,
        path: "/modified"
      }).then(data => {
        //ensure response body is correct from server
        expect(data).to.deep.equal({ mock: "data" });
        //ensure all http calls are done
        expect(nock.isDone()).to.be.true;

        scope.get("/modified").reply(
          200,
          function() {
            return { mock: "data_modified" };
          },
          { ETag: "new etag" }
        );

        return StaticClient.get({
          client: this.client,
          path: "/modified"
        }).then(data => {
          //ensure content is not empty and equals to the modified content
          expect(data).to.deep.equal({ mock: "data_modified" });
          expect(nock.isDone()).to.be.true;
        });
      });
    });

    it("sdk does not add if-none-match header and returns cached content without etag on 200 response", function() {
      const scope = nock("https://somewhere")
        .get("/cached")
        .reply(200, { mock: "data" }, { "Cache-Control": "max-age=100000000" });

      // make first request and get response from server
      return StaticClient.get({
        client: this.client,
        path: "/cached"
      }).then(data => {
        //ensure response body is correct from server
        expect(data).to.deep.equal({ mock: "data" });
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

        return StaticClient.get({
          client: this.client,
          path: "/cached"
        }).then(data => {
          //ensure content is not empty and equals to the cached content
          expect(data).to.deep.equal({ mock: "data" });
          // Nock is not done as one of the mock is never called
          expect(nock.isDone()).to.be.false;
        });
      });
    });
  });

  describe("base client last-modified based conditional get tests", function() {
    afterEach(nock.cleanAll);

    it("sdk does not add if-modified-since header and returns cached content on 200 response", function() {
      const dateExpires = new Date(new Date() + 10000000).toUTCString();
      const scope = nock("https://somewhere")
        .get("/no-lastmodified-header")
        .reply(
          200,
          { mock: "data" },
          {
            "Cache-Control": "max-age=10000",
            Expires: dateExpires
          }
        );

      // make first request and get response from server
      return StaticClient.get({
        client: this.client,
        path: "/no-lastmodified-header"
      }).then(data => {
        //ensure response body is correct from server
        expect(data).to.deep.equal({ mock: "data" });
        //ensure all http calls are done
        expect(nock.isDone()).to.be.true;

        // This mock is never called
        scope.get("/no-lastmodified-header").reply(200, function() {
          expect(this.req.headers["if-modified-since"]).to.null;
          return { mock: "data_modified" };
        });

        return StaticClient.get({
          client: this.client,
          path: "/no-lastmodified-header"
        }).then(data => {
          //ensure content is not empty and equals to the cached content
          expect(data).to.deep.equal({ mock: "data" });
          // Nock is not as one http request is declared and not called
          expect(nock.isDone()).to.be.false;
        });
      });
    });

    it("sdk does not add if-modified-since header on cached content w/o Expires header", function() {
      const dateLastModified = new Date(new Date() - 10000000).toUTCString();
      const scope = nock("https://somewhere")
        .get("/missing-expires-header")
        .reply(
          200,
          { mock: "data" },
          {
            "Last-Modified": dateLastModified,
            "Cache-Control": "max-age=100000000"
          }
        );

      // make first request and get response from server
      return StaticClient.get({
        client: this.client,
        path: "/missing-expires-header"
      }).then(data => {
        //ensure response body is correct from server
        expect(data).to.deep.equal({ mock: "data" });
        //ensure all http calls are done
        expect(nock.isDone()).to.be.true;

        //this nock is never called as the cached content is missing expires header
        scope.get("/missing-expires-header").reply(304, function() {
          expect(this.req.headers["if-modified-since"]).to.be.null;
        });

        return StaticClient.get({
          client: this.client,
          path: "/missing-expires-header"
        }).then(data => {
          //ensure content is not empty and equals to the cached content
          expect(data).to.deep.equal({ mock: "data" });
          expect(nock.isDone()).to.be.false;
        });
      });
    });
  });
};
