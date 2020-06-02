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
 * Integration tests with 2 seconds delay to verify the cached content
 * for Salesforce Commerce SDK cache manager interface.
 */
module.exports = function() {
  const expect = chai.expect;

  describe("base client etag based delayed conditional get tests", function() {
    afterEach(nock.cleanAll);
    this.timeout(15000);

    it("sdk adds if-none-match header and after delay returns cached content on 304 response", function(done) {
      const client = this.client;
      const scope = nock("https://somewhere")
        .get("/unmodified")
        .reply(
          200,
          { mock: "data" },
          { ETag: "etag", "Cache-Control": "must-revalidate, max-age=1" }
        );

      // make first request and get response from server
      StaticClient.get({
        client: client,
        path: "/unmodified"
      }).then(data => {
        //ensure response body is correct from server
        expect(data).to.deep.equal({ mock: "data" });
        //ensure all http calls are done
        //expect(nock.isDone()).to.be.true;

        scope.get("/unmodified").reply(304, function() {
          //verify if sdk adds if-none-match header
          expect(this.req.headers["if-none-match"][0]).to.deep.equal("etag");
        });

        setTimeout(function() {
          StaticClient.get({
            client: client,
            path: "/unmodified"
          }).then(data => {
            //ensure content is not empty and equals to the cached content
            expect(data).to.deep.equal({ mock: "data" });
            expect(nock.isDone()).to.be.true;
            done();
          });
        }, 2000);
      });
    });

    it("sdk adds if-none-match header after delay with updated etag on 200 response", function(done) {
      const client = this.client;
      const scope = nock("https://somewhere")
        .get("/modified")
        .reply(
          200,
          { mock: "data" },
          { ETag: "etag", "Cache-Control": "must-revalidate, max-age=1" }
        );

      // make first request and get response from server
      StaticClient.get({
        client: client,
        path: "/modified"
      }).then(data => {
        //ensure response body is correct from server
        expect(data).to.deep.equal({ mock: "data" });
        //ensure all http calls are done
        expect(nock.isDone()).to.be.true;

        scope.get("/modified").reply(
          304,
          function() {
            expect(this.req.headers["if-none-match"][0]).to.deep.equal("etag");
          },
          { ETag: "new etag", "Cache-Control": "must-revalidate, max-age=1" }
        );

        setTimeout(function() {
          StaticClient.get({
            client: client,
            path: "/modified"
          }).then(data => {
            //ensure content is not empty and equals to the cached content
            expect(data).to.deep.equal({ mock: "data" });
            expect(nock.isDone()).to.be.true;

            scope.get("/modified").reply(
              304,
              function() {
                expect(this.req.headers["if-none-match"][0]).to.deep.equal(
                  "new etag"
                );
              },
              {
                ETag: "new etag",
                "Cache-Control": "must-revalidate, max-age=1"
              }
            );

            setTimeout(function() {
              StaticClient.get({
                client: client,
                path: "/modified"
              }).then(data => {
                //ensure content is not empty and equals to the cached content
                expect(data).to.deep.equal({ mock: "data" });
                expect(nock.isDone()).to.be.true;
                done();
              });
            }, 2000);
          });
        }, 2000);
      });
    });
  });

  describe("base client last-modified based delayed conditional get tests", function() {
    afterEach(nock.cleanAll);

    it("sdk adds if-modified-since header and returns cached content on 304 response", function(done) {
      const client = this.client;

      const dateLastModified = new Date(Date.now() - 10000000).toUTCString();
      const nowTimestamp = Date.now();
      //set past expiry, since ttl is not set by default, this asset should be cached
      const dateExpires = new Date(nowTimestamp - 100000).toUTCString();

      const scope = nock("https://somewhere")
        .get("/lastmodified")
        .reply(
          200,
          { mock: "data" },
          {
            "Cache-Control": "must-revalidate",
            "Last-Modified": dateLastModified,
            Expires: dateExpires
          }
        );

      // make first request and get response from server
      StaticClient.get({
        client: client,
        path: "/lastmodified"
      }).then(data => {
        //ensure response body is correct from server
        expect(data).to.deep.equal({ mock: "data" });
        //ensure all http calls are done
        expect(nock.isDone()).to.be.true;

        scope.get("/lastmodified").reply(304, function() {
          expect(this.req.headers["if-modified-since"][0]).to.deep.equal(
            dateLastModified
          );
        });

        StaticClient.get({
          client: client,
          path: "/lastmodified"
        }).then(data => {
          //ensure content is not empty and equals to the cached content
          expect(data).to.deep.equal({ mock: "data" });
          expect(nock.isDone()).to.be.true;
          done();
        });
      });
    });

    it("sdk adds updated if-modified-since header on 304 response", function(done) {
      const client = this.client;
      const nowTimestamp = Date.now();
      const lastModified = new Date(nowTimestamp - 20000000).toUTCString();
      const newLastModified = new Date(nowTimestamp - 10000000).toUTCString();

      const dateExpires = new Date(nowTimestamp - 100000).toUTCString();
      const scope = nock("https://somewhere")
        .get("/not-modified")
        .reply(
          200,
          { mock: "data" },
          {
            "Cache-Control": "must-revalidate",
            "Last-Modified": lastModified,
            Expires: dateExpires
          }
        );

      // make first request and get response from server
      StaticClient.get({
        client: client,
        path: "/not-modified"
      }).then(data => {
        //ensure response body is correct from server
        expect(data).to.deep.equal({ mock: "data" });
        //ensure all http calls are done
        expect(nock.isDone()).to.be.true;

        scope.get("/not-modified").reply(
          304,
          function() {
            expect(this.req.headers["if-modified-since"][0]).to.deep.equal(
              lastModified
            );
          },
          {
            "Cache-Control": "must-revalidate",
            "Last-Modified": newLastModified,
            Expires: dateExpires
          }
        );

        StaticClient.get({
          client: client,
          path: "/not-modified"
        }).then(data => {
          //ensure content is not empty and equals to the cached content
          expect(data).to.deep.equal({ mock: "data" });
          expect(nock.isDone()).to.be.true;
          scope.get("/not-modified").reply(304, function() {
            expect(this.req.headers["if-modified-since"][0]).to.deep.equal(
              newLastModified
            );
          });
          StaticClient.get({
            client: client,
            path: "/not-modified"
          }).then(data => {
            //ensure content is not empty and equals to the cached content
            expect(data).to.deep.equal({ mock: "data" });
            expect(nock.isDone()).to.be.true;
            done();
          });
        });
      });
    });

    it("sdk adds if-modified-since header and returns modified content on 200 response", function(done) {
      const client = this.client;
      const nowTimestamp = Date.now();
      const dateLastModified = new Date(nowTimestamp - 10000000).toUTCString();
      const dateExpires = new Date(nowTimestamp - 100000).toUTCString();
      const scope = nock("https://somewhere")
        .get("/lastmodified-since")
        .reply(
          200,
          { mock: "data" },
          {
            "Cache-Control": "must-revalidate",
            "Last-Modified": dateLastModified,
            Expires: dateExpires
          }
        );

      // make first request and get response from server
      StaticClient.get({
        client: client,
        path: "/lastmodified-since"
      }).then(data => {
        //ensure response body is correct from server
        expect(data).to.deep.equal({ mock: "data" });
        //ensure all http calls are done
        expect(nock.isDone()).to.be.true;

        scope.get("/lastmodified-since").reply(200, function() {
          expect(this.req.headers["if-modified-since"][0]).to.deep.equal(
            dateLastModified
          );
          return { mock: "data_modified" };
        });

        StaticClient.get({
          client: client,
          path: "/lastmodified-since"
        }).then(data => {
          //ensure content is not empty and equals to the modified content
          expect(data).to.deep.equal({ mock: "data_modified" });
          expect(nock.isDone()).to.be.true;
          done();
        });
      });
    });
  });
};
