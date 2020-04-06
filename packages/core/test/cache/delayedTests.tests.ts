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
      _get({
        client: client,
        path: "/unmodified"
      }).then(data => {
        //ensure response body is correct from server
        expect(data).to.eql({ mock: "data" });
        //ensure all http calls are done
        //expect(nock.isDone()).to.be.true;

        scope.get("/unmodified").reply(304, function() {
          //verify if sdk adds if-none-match header
          expect(this.req.headers["if-none-match"][0]).to.eql("etag");
        });

        setTimeout(function() {
          _get({
            client: client,
            path: "/unmodified"
          }).then(data => {
            //ensure content is not empty and equals to the cached content
            expect(data).to.eql({ mock: "data" });
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
      _get({
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
          { ETag: "new etag", "Cache-Control": "must-revalidate, max-age=1" }
        );

        setTimeout(function() {
          _get({
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
              {
                ETag: "new etag",
                "Cache-Control": "must-revalidate, max-age=1"
              }
            );

            setTimeout(function() {
              _get({
                client: client,
                path: "/modified"
              }).then(data => {
                //ensure content is not empty and equals to the cached content
                expect(data).to.eql({ mock: "data" });
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
    this.timeout(15000);

    it("sdk adds if-modified-since header and returns cached content on 304 response", function(done) {
      const client = this.client;

      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      const dateLastModified = new Date(Date.now() - 10000000).toUTCString();
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      const nowTimestamp = Date.now();
      const dateExpires = new Date(nowTimestamp + 1800).toUTCString();
      const scope = nock("https://somewhere")
        .get("/lastmodified")
        .reply(
          200,
          { mock: "data" },
          {
            "Cache-Control": "must-revalidate,max-age=1",
            "Last-Modified": dateLastModified
          }
        );

      // make first request and get response from server
      _get({
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

        setTimeout(function() {
          _get({
            client: client,
            path: "/lastmodified"
          }).then(data => {
            //ensure content is not empty and equals to the cached content
            expect(data).to.eql({ mock: "data" });
            expect(nock.isDone()).to.be.true;
            done();
          });
        }, 2000);
      });
    });

    it("sdk adds updated if-modified-since header on 304 response", function(done) {
      const client = this.client;

      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      const nowTimestamp = Date.now();

      const lastModified = new Date(nowTimestamp - 20000000).toUTCString();

      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      const newLastModified = new Date(nowTimestamp - 10000000).toUTCString();

      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      const dateExpires = new Date(nowTimestamp + 1200).toUTCString();
      const scope = nock("https://somewhere")
        .get("/not-modified")
        .reply(
          200,
          { mock: "data" },
          {
            "Cache-Control": "must-revalidate,max-age=1",
            "Last-Modified": lastModified,
            Expires: dateExpires
          }
        );

      // make first request and get response from server
      _get({
        client: client,
        path: "/not-modified"
      }).then(data => {
        //ensure response body is correct from server
        expect(data).to.eql({ mock: "data" });
        //ensure all http calls are done
        expect(nock.isDone()).to.be.true;

        scope.get("/not-modified").reply(
          304,
          function() {
            expect(this.req.headers["if-modified-since"][0]).to.eql(
              lastModified
            );
          },
          {
            "Cache-Control": "must-revalidate,max-age=1",
            "Last-Modified": newLastModified,
            Expires: dateExpires
          }
        );

        setTimeout(function() {
          _get({
            client: client,
            path: "/not-modified"
          }).then(data => {
            //ensure content is not empty and equals to the cached content
            expect(data).to.eql({ mock: "data" });
            expect(nock.isDone()).to.be.true;
            scope.get("/not-modified").reply(304, function() {
              expect(this.req.headers["if-modified-since"][0]).to.eql(
                newLastModified
              );
            });
            setTimeout(function() {
              _get({
                client: client,
                path: "/not-modified"
              }).then(data => {
                //ensure content is not empty and equals to the cached content
                expect(data).to.eql({ mock: "data" });
                expect(nock.isDone()).to.be.true;
                done();
              });
            }, 2000);
          });
        }, 2000);
      });
    });

    it("sdk adds if-modified-since header and returns modified content on 200 response", function(done) {
      const client = this.client;
      const nowTimestamp = Date.now();

      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      const dateLastModified = new Date(nowTimestamp - 10000000).toUTCString();
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      const dateExpires = new Date(nowTimestamp + 10000000).toUTCString();
      const scope = nock("https://somewhere")
        .get("/lastmodified-since")
        .reply(
          200,
          { mock: "data" },
          {
            "Cache-Control": "must-revalidate,max-age=1",
            "Last-Modified": dateLastModified,
            Expires: dateExpires
          }
        );

      // make first request and get response from server
      _get({
        client: client,
        path: "/lastmodified-since"
      }).then(data => {
        //ensure response body is correct from server
        expect(data).to.eql({ mock: "data" });
        //ensure all http calls are done
        expect(nock.isDone()).to.be.true;

        scope.get("/lastmodified-since").reply(200, function() {
          expect(this.req.headers["if-modified-since"][0]).to.eql(
            dateLastModified
          );
          return { mock: "data_modified" };
        });

        setTimeout(function() {
          _get({
            client: client,
            path: "/lastmodified-since"
          }).then(data => {
            //ensure content is not empty and equals to the modified content
            expect(data).to.eql({ mock: "data_modified" });
            expect(nock.isDone()).to.be.true;
            done();
          });
        }, 2000);
      });
    });
  });
}
