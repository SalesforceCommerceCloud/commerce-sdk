/*
 * Copyright (c) 2024, salesforce.com, inc.
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
        clientId: CLIENT_ID,
        organizationId: ORGANIZATION_ID,
        shortCode: SHORT_CODE,
        siteId: SITE_ID,
      },
    });

    const options = {
      parameters: {
        c_validCustomParam: "custom_param",
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
        c_validCustomParam: "custom_param",
      })
      .reply(200, MOCK_RESPONSE);

    const response = await customersClient.authorizeCustomer(options);
    expect(response).to.be.deep.equal(MOCK_RESPONSE);
  });

  it("throws error on invalid params", async () => {
    const customersClient = new ShopperCustomers({
      parameters: {
        clientId: CLIENT_ID,
        organizationId: ORGANIZATION_ID,
        shortCode: SHORT_CODE,
        siteId: SITE_ID,
      },
    });

    const options = {
      parameters: {
        c_validCustomParam: "custom_param",
        invalidQueryParam: "invalid_param",
      },
      body: { type: "guest" },
    };

    let expectedError;
    try {
      await customersClient.authorizeCustomer(options);
    } catch (error) {
      expectedError = error;
    }
    expect(expectedError.message).to.be.equal(
      "Invalid Parameter: invalidQueryParam"
    );
  });
});
