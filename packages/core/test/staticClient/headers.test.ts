/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";

import nock from "nock";
import { Scope, RequestHeaderMatcher } from "nock/types";

import chai from "chai";
import chaiAsPromised from "chai-as-promised";

const expect = chai.expect;

before(() => {
  chai.should();
  chai.use(chaiAsPromised);
});

import { BaseClient } from "../../src/base/client";
import { _get, _post, getHeader } from "../../src/base/staticClient";

// Common parameters used to mock requests
const MOCK_BASE_URI = "https://somewhere";
const MOCK_PATH = "/over/the/rainbow";
// Common headers used in tests
type Headers = Record<string, string>;
const CONNECTION_CLOSE = { connection: "close" };
const CONNECTION_KEEP_ALIVE = { connection: "keep-alive" };
const CONTENT_TYPE_JSON = { "Content-Type": "application/json" };
const CONTENT_TYPE_XML = { "Content-Type": "text/xml" };
const LANGUAGE_HEADER = { "Accept-Language": "en-US" };

function createClient(headers?: Headers): BaseClient {
  return new BaseClient({
    baseUri: MOCK_BASE_URI,
    headers
  });
}

function interceptGet(reqheaders: Record<string, RequestHeaderMatcher>): Scope {
  return nock(MOCK_BASE_URI, { reqheaders })
    .get(MOCK_PATH)
    .reply(200, {});
}

function interceptPost(
  reqheaders: Record<string, RequestHeaderMatcher>
): Scope {
  return nock(MOCK_BASE_URI, { reqheaders })
    .post(MOCK_PATH)
    .reply(201, {});
}

async function testGetRequest(
  client: BaseClient,
  scope: Scope,
  headers?: Headers
): Promise<void> {
  await _get({ client, headers, path: MOCK_PATH });
  expect(scope.isDone()).to.be.true;
}

async function testPostRequest(
  client: BaseClient,
  scope: Scope,
  headers?: Headers
): Promise<void> {
  await _post({ client, headers, path: MOCK_PATH, body: {} });
  expect(scope.isDone()).to.be.true;
}

describe("Base Client headers", () => {
  const DEFAULT_CLIENT = createClient();

  describe("Headers specified on client", () => {
    afterEach(nock.cleanAll);

    const TWO_HEADER = {
      "Accept-Language": "en-US",
      "Max-Forwards": "10"
    };

    it("makes correct get call with headers", () => {
      const client = createClient(LANGUAGE_HEADER);
      const scope = interceptGet(LANGUAGE_HEADER);
      return testGetRequest(client, scope);
    });

    it("makes correct call with two headers", () => {
      const client = createClient(TWO_HEADER);
      const scope = interceptGet(TWO_HEADER);
      return testGetRequest(client, scope);
    });

    it("makes correct call for post with two headers", () => {
      const client = createClient(TWO_HEADER);
      const scope = interceptPost(TWO_HEADER);
      return testPostRequest(client, scope);
    });

    it("cannot overwrite content-type for post", () => {
      const client = createClient(CONTENT_TYPE_XML);
      const scope = interceptPost(CONTENT_TYPE_JSON);
      return testPostRequest(client, scope);
    });

    it("makes call with connection header set to close by default", () => {
      const client = DEFAULT_CLIENT;
      const scope = interceptGet(CONNECTION_CLOSE);
      return testGetRequest(client, scope);
    });

    it("makes call with the connection header set in the client", () => {
      const client = createClient(CONNECTION_KEEP_ALIVE);
      const scope = interceptGet(CONNECTION_KEEP_ALIVE);
      return testGetRequest(client, scope);
    });
  });

  describe("Headers specified at endpoint", () => {
    afterEach(nock.cleanAll);

    const TWO_HEADER = {
      "Accept-Language": "fr-CH",
      "Max-Forwards": "10"
    };
    const MERGE_HEADER = {
      "Accept-Language": "en-US",
      "Max-Forwards": "10"
    };

    it("makes correct get call with endpoint headers", () => {
      const client = DEFAULT_CLIENT;
      const scope = interceptGet(LANGUAGE_HEADER);
      return testGetRequest(client, scope, LANGUAGE_HEADER);
    });

    it("makes correct call with two endpoint headers", () => {
      const client = DEFAULT_CLIENT;
      const scope = interceptGet(TWO_HEADER);
      return testGetRequest(client, scope, TWO_HEADER);
    });

    it("makes correct call for post with two endpoint headers", () => {
      const client = DEFAULT_CLIENT;
      const scope = interceptPost(TWO_HEADER);
      return testPostRequest(client, scope, TWO_HEADER);
    });

    it("makes correct call for post with client and endpoint headers", () => {
      const client = createClient(TWO_HEADER);
      const scope = interceptPost(MERGE_HEADER);
      return testPostRequest(client, scope, LANGUAGE_HEADER);
    });

    it("cannot overwrite content-type for post", () => {
      const client = DEFAULT_CLIENT;
      const scope = interceptPost(CONTENT_TYPE_JSON);
      return testPostRequest(client, scope, CONTENT_TYPE_XML);
    });

    it("makes call with connection header passed to the get function ", () => {
      const client = DEFAULT_CLIENT;
      const scope = interceptGet(CONNECTION_KEEP_ALIVE);
      return testGetRequest(client, scope, CONNECTION_KEEP_ALIVE);
    });
  });

  describe("Normalized header helper", () => {
    it("returns the passed header if a header with the same name and same case exists", () => {
      const headers = { connection: "keep-alive" };
      const result = getHeader("connection", headers);
      expect(result).to.equal("connection");
    });

    it("returns the other header if a header with the same name and different case exists", () => {
      const headers = { Connection: "keep-alive" };
      const result = getHeader("coNneCtiOn", headers);
      expect(result).to.equal("Connection");
    });

    it("returns the passed header if a header with the same name does not exist", () => {
      const headers = { Con: "keep-alive" };
      const result = getHeader("Connection", headers);
      expect(result).to.equal("Connection");
    });
  });
});
