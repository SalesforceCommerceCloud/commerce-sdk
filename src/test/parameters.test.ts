/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import nock from "nock";
import { expect } from "chai";
import { ShopperCustomers } from "../../renderedTemplates/customer/shopperCustomers/shopperCustomers";

const SITE_ID = "SITE_ID";
const CLIENT_ID = "CLIENT_ID";
const SHORT_CODE = "SHORT_CODE";
const ORGANIZATION_ID = "ORGANIZATION_ID";

const MOCK_RESPONSE = { mockResponse: true };

describe("Parameters", () => {
  afterEach(() => nock.cleanAll());

  it("allow custom query params", async () => {
    const customersClient = new ShopperCustomers({
      parameters: {
        shortCode: SHORT_CODE,
      },
    });

    const options = {
      parameters: {
        siteId: SITE_ID,
        organizationId: ORGANIZATION_ID,
        clientId: CLIENT_ID,
        c_validCustomParam: "custom_param",
        invalidParam: "invalid_param",
      },
      body: { type: "guest" },
    };

    nock(`https://${SHORT_CODE}.api.commercecloud.salesforce.com`)
      .post(
        `/customer/shopper-customers/v1/organizations/${ORGANIZATION_ID}/customers/actions/login`
      )
      .query({
        siteId: SITE_ID,
        clientId: CLIENT_ID,
        // expect `c_validCustomParam` but not `invalidParam`
        c_validCustomParam: "custom_param",
      })
      .reply(200, MOCK_RESPONSE);

    const response = await customersClient.authorizeCustomer(options);
    expect(response).to.be.deep.equal(MOCK_RESPONSE);
  });
});
