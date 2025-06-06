/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from "chai";
import { ClientConfig } from "commerce-sdk";
import { ShopperLogin } from "commerce-sdk/dist/customer/customer";
import { Products } from "commerce-sdk/dist/product/product";
import nock from "nock";

const config: ClientConfig = {
  parameters: {
    shortCode: "SHORT_CODE",
    organizationId: "ORGANIZATION_ID",
    siteId: "SITE_ID",
    clientId: "CLIENT_ID",
  },
};

describe("Requests with body", () => {
  beforeEach(nock.cleanAll);

  it("sends correct media type for urlencoded endpoints", async () => {
    const body = {
      token: "TOKEN",
      token_type_hint: "REFRESH_TOKEN",
    };
    nock("https://short_code.api.commercecloud.salesforce.com")
      .filteringRequestBody((body) => {
        // Putting the assertion here isn't ideal, but it's the only place I can find that nock
        // exposes the raw contents of the request body. (The body provided to `.post` has already
        // been parsed to an object, so we can't use that to detect the type.)
        expect(body).to.equal("token=TOKEN&token_type_hint=REFRESH_TOKEN");
        return body;
      })
      .post(
        "/shopper/auth/v1/organizations/ORGANIZATION_ID/oauth2/revoke",
        body
      )
      .matchHeader("Content-Type", "application/x-www-form-urlencoded")
      .reply(200);

    const client = new ShopperLogin(config);
    await client.revokeToken({ body });
    expect(nock.isDone()).to.be.true;
  });

  it("sends correct media type for JSON endpoints", async () => {
    const body = { query: "pants" };
    nock("https://short_code.api.commercecloud.salesforce.com")
      .filteringRequestBody((body) => {
        // Putting the assertion here isn't ideal, but it's the only place I can find that nock
        // exposes the raw contents of the request body. (The body provided to `.post` has already
        // been parsed to an object, so we can't use that to detect the type.)
        expect(body).to.equal('{"query":"pants"}');
        return body;
      })
      .post(
        "/product/products/v1/organizations/ORGANIZATION_ID/product-search",
        body
      )
      .query({ siteId: "SITE_ID" })
      .matchHeader("Content-Type", "application/json")
      .reply(200);

    const client = new Products(config);
    await client.searchProducts({ body });
    expect(nock.isDone()).to.be.true;
  });
});
