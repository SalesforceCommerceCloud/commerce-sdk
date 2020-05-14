/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import nock from "nock";

import chai from "chai";
import chaiAsPromised from "chai-as-promised";

const expect = chai.expect;

before(() => {
  chai.should();
  chai.use(chaiAsPromised);
});

import { BaseClient, ResponseError } from "../../src/base/client";
import { _get } from "../../src/base/staticClient";

describe("retry settings test", () => {
  let client: BaseClient;
  beforeEach(() => {
    client = new BaseClient({
      baseUri: "https://retry.test",
      retrySettings: {
        // This means 3 total calls are made
        retries: 2,
        maxTimeout: 200,
        minTimeout: 100
      }
    });
  });
  afterEach(nock.cleanAll);

  it("Tries 3 times", async () => {
    const failure = nock("https://retry.test")
      .get("/three")
      .twice()
      .reply(503);

    const success = nock("https://retry.test")
      .get("/three")
      .reply(200, {});

    await _get({
      client: client,
      path: "/three"
    });
    expect(failure.isDone()).to.be.true;
    expect(success.isDone()).to.be.true;
  });

  it("Disable retry for a call", async () => {
    const failure = nock("https://retry.test")
      .get("/no-retry")
      .reply(503);

    const success = nock("https://retry.test")
      .get("/no-retry")
      .reply(200, {});

    await _get({
      client: client,
      path: "/no-retry",
      retrySettings: {
        retries: 0
      }
    }).should.eventually.be.rejectedWith(ResponseError);
    expect(failure.isDone()).to.be.true;
    expect(success.pendingMocks()).to.be.not.empty;
  });

  it("Doesn't try 4 times", async () => {
    const failure = nock("https://retry.test")
      .get("/four")
      .thrice()
      .reply(503);

    const success = nock("https://retry.test")
      .get("/four")
      .reply(200, {});

    await _get({
      client: client,
      path: "/four"
    }).should.eventually.be.rejectedWith(ResponseError);
    expect(failure.isDone()).to.be.true;
    expect(success.pendingMocks()).to.be.not.empty;
  });
});
