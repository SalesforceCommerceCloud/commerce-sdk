/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from "chai";
import { slasHelpers, Customer } from "commerce-sdk";
import nock from "nock";

const createSlasClient = (clientConfig) => {
  return new Customer.ShopperLogin(clientConfig);
};

describe("slasHelpers", () => {
  afterEach(nock.cleanAll);

  const clientConfig = {
    parameters: {
      shortCode: "short_code",
      organizationId: "organization_id",
      clientId: "client_id",
      siteId: "site_id",
    },
  };

  const expectedTokenResponse: Customer.ShopperLogin.TokenResponse = {
    access_token: "access_token",
    id_token: "id_token",
    refresh_token: "refresh_token",
    expires_in: 0,
    token_type: "token_type",
    usid: "usid",
    customer_id: "customer_id",
    enc_user_id: "enc_user_id",
  };

  it("can retrieve an access token from guest login flow", async () => {
    const { shortCode, organizationId } = clientConfig.parameters;

    nock(`https://${shortCode}.api.commercecloud.salesforce.com`)
      .get(`/shopper/auth/v1/organizations/${organizationId}/oauth2/authorize`)
      .query(true)
      .reply(303, { response_body: "response_body" });

    nock(`https://${shortCode}.api.commercecloud.salesforce.com`)
      .post(`/shopper/auth/v1/organizations/${organizationId}/oauth2/token`)
      .query(true)
      .reply(200, expectedTokenResponse);

    const slasClient = createSlasClient(clientConfig);
    const tokenResponse = await slasHelpers.loginGuestUser(slasClient, {
      redirectURI: "redirect_uri",
    });
    const accessToken = tokenResponse.access_token;

    expect(nock.isDone()).to.be.true;
    expect(accessToken).to.be.equal(expectedTokenResponse.access_token);
    expect(tokenResponse).to.be.deep.equals(expectedTokenResponse);
  });
});
