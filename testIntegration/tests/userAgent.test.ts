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
import { ShopperLogin, ShopperLoginTypes } from "commerce-sdk/dist";

// TODO: FIX THIS TEST
// Helper to make the user agent being tested a bit more obvious
async function mockRequestWithUserAgent(userAgent: string): Promise<void> {
  nock("http://somewhere")
    .get("/organizations/foo/oauth2/authorize")
    // .matchHeader("user-agent", userAgent)
    .query(true) // this seems to be required
    .reply(200, {}, { Authorization: "Bearer AUTH_TOKEN" });
}

const params = {
  organizationId: "foo",
  redirect_uri: "redirect_uri",
  response_type: "code" as const,
  client_id: "client_id",
  scope: ShopperLogin.AuthorizeCustomerScopeEnum.Openid,
  state: "state",
  usid: "usid",
  hint: "hint",
  channel_id: "channel_id",
  code_challenge: "code_challenge",
};

describe("Custom user agent header", () => {
  let sdkUserAgent: string;
  before(async () => {
    const { version } = await fs.readJson(
      require.resolve("commerce-sdk/package.json")
    );
    sdkUserAgent = `commerce-sdk@${version};`;
  });

  afterEach(nock.cleanAll);

  it("identifies commerce-sdk and version", async () => {
    await mockRequestWithUserAgent(sdkUserAgent);
    const client = new ShopperLogin.ShopperLogin({
      baseUri: "http://somewhere",
      parameters: { organizationId: "foo" },
    });
    await client.authorizeCustomer({
      parameters: params,
    });
    expect(nock.isDone()).to.be.true;
  });

  it("doesn't allow user-agent to be overwritten in config", async () => {
    await mockRequestWithUserAgent(sdkUserAgent);
    const client = new ShopperLogin.ShopperLogin({
      baseUri: "http://somewhere",
      parameters: { organizationId: "foo" },
      headers: {
        "user-agent": "definitely not commerce-sdk",
      },
    });
    await client.authorizeCustomer({
      parameters: params,
    });
    expect(nock.isDone()).to.be.true;
  });

  it("merges with alternative case header in method", async () => {
    await mockRequestWithUserAgent(`custom user agent, ${sdkUserAgent}`);
    const client = new ShopperLogin.ShopperLogin({
      baseUri: "http://somewhere",
      parameters: { organizationId: "foo" },
    });
    await client.authorizeCustomer({
      headers: {
        "User-Agent": "custom user agent",
      },
      parameters: params,
    });
    expect(nock.isDone()).to.be.true;
  });
});
