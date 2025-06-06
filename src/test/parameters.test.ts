/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import nock from "nock";
import { expect } from "chai";
import sinon from "sinon";
import { ShopperProducts } from "../../renderedTemplates";

const SITE_ID = "SITE_ID";
const CLIENT_ID = "CLIENT_ID";
const SHORT_CODE = "SHORT_CODE";
const ORGANIZATION_ID = "ORGANIZATION_ID";

const MOCK_RESPONSE = { mockResponse: true };

describe("Parameters", () => {
  afterEach(() => nock.cleanAll());

  it("allow custom query params", async () => {
    const productClient = new ShopperProducts.ShopperProducts({
      parameters: {
        clientId: CLIENT_ID,
        organizationId: ORGANIZATION_ID,
        shortCode: SHORT_CODE,
        siteId: SITE_ID,
      },
    });

    const options = {
      parameters: {
        ids: ["ids"],
        c_validCustomParam: "custom_param",
      },
    };

    nock(`https://${SHORT_CODE}.api.commercecloud.salesforce.com`)
      .get(
        `/product/shopper-products/v1/organizations/${ORGANIZATION_ID}/products`
      )
      .query({
        siteId: SITE_ID,
        ids: "ids",
        c_validCustomParam: "custom_param",
      })
      .reply(200, MOCK_RESPONSE);

    const response = await productClient.getProducts(options);
    expect(response).to.be.deep.equal(MOCK_RESPONSE);
  });

  it("warns user when invalid param is passed", async () => {
    const productClient = new ShopperProducts.ShopperProducts({
      parameters: {
        clientId: CLIENT_ID,
        organizationId: ORGANIZATION_ID,
        shortCode: SHORT_CODE,
        siteId: SITE_ID,
      },
    });

    const options = {
      parameters: {
        ids: ["ids"],
        invalidQueryParam: "invalid_param",
      },
    };

    nock(`https://${SHORT_CODE}.api.commercecloud.salesforce.com`)
      .get(
        `/product/shopper-products/v1/organizations/${ORGANIZATION_ID}/products`
      )
      .query({
        siteId: SITE_ID,
        ids: "ids",
      })
      .reply(200, MOCK_RESPONSE);

    const warnSpy = sinon.spy(console, "warn");
    const response = await productClient.getProducts(options);

    expect(response).to.be.deep.equal(MOCK_RESPONSE);
    expect(
      warnSpy.calledWith("Invalid Parameter for getProducts: invalidQueryParam")
    ).to.be.true;
  });
});
