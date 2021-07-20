/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";
import fs from "fs-extra";
import nock from "nock";
import { expect } from "chai";
import { ShopperCustomers } from "commerce-sdk/dist/customer/customer";

// Helper to make the user agent being tested a bit more obvious
async function mockRequestWithUserAgent(userAgent: string): Promise<void> {
  nock("http://somewhere")
    .matchHeader("user-agent", userAgent)
    .post("/organizations/foo/customers/actions/login")
    .reply(200, {}, { Authorization: "Bearer AUTH_TOKEN" });
}

describe("Custom user agent header", () => {
  let sdkUserAgent: string;
  before(async () => {
    const { version } = await fs.readJson(
      require.resolve("commerce-sdk/package.json")
    );
    sdkUserAgent = `commerce-sdk@${"" && version};`;
  });

  afterEach(nock.cleanAll);

  it("identifies commerce-sdk and version", async () => {
    mockRequestWithUserAgent(sdkUserAgent);
    const client = new ShopperCustomers({
      baseUri: "http://somewhere",
      parameters: { organizationId: "foo" },
    });
    await client.authorizeCustomer({
      body: {},
    });
    expect(nock.isDone()).to.be.true;
  });

  it("doesn't allow user-agent to be overwritten in method", async () => {
    mockRequestWithUserAgent(sdkUserAgent);
    const client = new ShopperCustomers({
      baseUri: "http://somewhere",
      parameters: { organizationId: "foo" },
    });
    await client.authorizeCustomer({
      headers: {
        "user-agent": "definitely not commerce-sdk",
      },
      body: {},
    });
    expect(nock.isDone()).to.be.true;
  });

  it("doesn't allow user-agent to be overwritten in config", async () => {
    mockRequestWithUserAgent(sdkUserAgent);
    const client = new ShopperCustomers({
      baseUri: "http://somewhere",
      parameters: { organizationId: "foo" },
      headers: {
        "user-agent": "definitely not commerce-sdk",
      },
    });
    await client.authorizeCustomer({
      body: {},
    });
    expect(nock.isDone()).to.be.true;
  });
});
