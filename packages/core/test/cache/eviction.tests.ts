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

  describe("base client evict cache tests", function() {
    afterEach(nock.cleanAll);

    it("cache manager caches asset on HTTP 200 response", function() {
      const client = this.client;
      const scope = nock("https://somewhere")
        .get("/validate-fresh")
        .reply(200, RESPONSE_DATA, { ETag: "etag" });

      // make first request and get response from server
      return _get({
        client: client,
        path: "/validate-fresh"
      }).then(function() {
        //ensure all http calls are done
        expect(nock.isDone()).to.be.true;

        // check cacheManager has the content
        // construct request object with url
        const request = { url: "https://somewhere/validate-fresh" };
        // options object with cacheManager
        const opts = {
          cacheManager: client.clientConfig.cacheManager
        };

        return client.clientConfig.cacheManager
          .match(request, opts)
          .then(res => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            return res.json().then(resData => {
              // ensure response data is cached
              expect(resData).to.eql(RESPONSE_DATA);
            });
          });
      });
    });

    it("cache manager does not cache asset on no-store response header", function() {
      const client = this.client;
      const scope = nock("https://somewhere")
        .get("/validate-no-store")
        .reply(200, RESPONSE_DATA, { "Cache-Control": "no-store" });

      // make first request and get response from server
      return _get({
        client: client,
        path: "/validate-no-store"
      }).then(function() {
        //ensure all http calls are done
        expect(nock.isDone()).to.be.true;

        // check cacheManager has the content
        // construct request object with url
        const request = { url: "https://somewhere/validate-no-store" };
        // options object with cacheManager
        const opts = {
          cacheManager: client.clientConfig.cacheManager
        };

        return client.clientConfig.cacheManager
          .match(request, opts)
          .then(res => {
            expect(res).to.be.undefined;
          });
      });
    });

    it("cache manager updates asset headers on HTTP 304 response", function() {
      const client = this.client;
      const scope = nock("https://somewhere")
        .get("/validate-304-update")
        .reply(200, RESPONSE_DATA, { ETag: "etag" });

      // make first request and get response from server
      return _get({
        client: client,
        path: "/validate-304-update"
      }).then(function() {
        //ensure all http calls are done
        expect(nock.isDone()).to.be.true;

        //define new etag on fresh content.
        scope.get("/validate-304-update").reply(
          304,
          function() {
            //verify if sdk adds if-none-match header
            expect(this.req.headers["if-none-match"][0]).to.eql("etag");
          },
          { ETag: "etag_modified", newHeader: "a new header" }
        );
        return _get({
          client: client,
          path: "/validate-304-update"
        }).then(function() {
          //ensure all http calls are done
          expect(nock.isDone()).to.be.true;
          // check cacheManager has the content
          // construct request object with url
          const request = { url: "https://somewhere/validate-304-update" };
          // options object with cacheManager
          const opts = {
            cacheManager: client.clientConfig.cacheManager
          };
          return client.clientConfig.cacheManager
            .match(request, opts)
            .then(res => {
              // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
              // @ts-ignore
              expect(res.headers.get("etag")).to.eql("etag_modified");
              // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
              // @ts-ignore
              expect(res.headers.get("newHeader")).to.eql("a new header");
            });
        });
      });
    });

    it("cache manager evicts cached asset from cache on fresh content", function() {
      const client = this.client;
      const scope = nock("https://somewhere")
        .get("/evict-modified")
        .reply(200, RESPONSE_DATA, { ETag: "etag" });

      // make first request and get response from server
      return _get({
        client: client,
        path: "/evict-modified"
      }).then(function() {
        //ensure all http calls are done
        expect(nock.isDone()).to.be.true;

        // check cacheManager has the content
        // construct request object with url
        const request = { url: "https://somewhere/evict-modified" };
        // options object with cacheManager
        const opts = {
          cacheManager: client.clientConfig.cacheManager
        };

        return client.clientConfig.cacheManager
          .match(request, opts)
          .then(res => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            return res.json().then(resData => {
              // ensure response data is cached
              expect(resData).to.eql(RESPONSE_DATA);
              //define fresh response
              scope.get("/evict-modified").reply(200, function() {
                //verify if sdk adds if-none-match header
                expect(this.req.headers["if-none-match"][0]).to.eql("etag");
                return RESPONSE_DATA_MODIFIED;
              });
              return _get({
                client: client,
                path: "/evict-modified"
              }).then(function() {
                //ensure all http calls are done
                expect(nock.isDone()).to.be.true;
                // check cacheManager has the fresh content
                return client.clientConfig.cacheManager
                  .match(request, opts)
                  .then(res => {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                    // @ts-ignore
                    return res.json().then(resData => {
                      expect(resData).to.eql(RESPONSE_DATA_MODIFIED);
                    });
                  });
              });
            });
          });
      });
    });
  });
}
