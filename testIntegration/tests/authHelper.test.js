/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";
import chai from "chai";
import { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { helpers } from "commerce-sdk";
import nock from "nock";

before(() => {
  chai.use(chaiAsPromised);
});

describe("JS: Auth Helper getShopperToken", () => {
  afterEach(nock.cleanAll);

  it("getShopperToken successful", async () => {
    nock("http://somewhere")
      .post("/organizations/foo/customers/actions/login", { type: "guest" })
      .reply(
        200,
        {
          authType: "guest",
          customerId: "ab1avTqmPIwc4MRq0cEs59LEka",
          preferredLocale: "en_US",
        },
        { Authorization: "Bearer AUTH_TOKEN" }
      );

    const shopperToken = await helpers.getShopperToken(
      {
        baseUri: "http://somewhere",
        parameters: { organizationId: "foo" },
      },
      { type: "guest" }
    );

    expect(nock.isDone()).to.be.true;
    expect(shopperToken.getAuthToken()).to.equal("AUTH_TOKEN");
  });
});
