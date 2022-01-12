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
      token:
        "ry5XU_WHX20S6Cn6W7keFIs7Pzkv4wTZJS9Yvh0Ve9A.cdBxoCY9Q3jffQQOFnb_qghbSmSRnn9-2H4GwFTDMTk",
      // eslint-disable-next-line @typescript-eslint/camelcase
      token_type_hint: "REFRESH_TOKEN",
    };
    nock("https://short_code.api.commercecloud.salesforce.com")
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
