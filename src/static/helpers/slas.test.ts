/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/* eslint-disable @typescript-eslint/camelcase  */

import nock from "nock";
import { expect } from "chai";
import { ShopperLogin } from "../../../renderedTemplates/customer/shopperLogin/shopperLogin";
import * as slasHelper from "./slas";
import sinon from "sinon";

const codeVerifier = "code_verifier";
const url = "https://localhost:3000/callback?usid=048adcfb-aa93-4978-be9e-09cb569fdcb9&code=J2lHm0cgXmnXpwDhjhLoyLJBoUAlBfxDY-AhjqGMC-o";

const clientConfig = {
    parameters: {
        shortCode: "short_code",
        organizationId: "organization_id",
        clientId: "client_id",
        siteId: "site_id",
    }
};

const credentials = {
  username: "shopper_user_id",
  password: "shopper_password",
  clientSecret: "client_secret"
};

const expectedTokenResponse: ShopperLogin.TokenResponse = {
  access_token: "access_token",
  id_token: "id_token",
  refresh_token: "refresh_token",
  expires_in: 0,
  token_type: "token_type",
  usid: "usid",
  customer_id: "customer_id",
  enc_user_id: "enc_user_id",
};

const parameters = {
  redirectURI: "redirect_uri",
  refreshToken: "refresh_token",
  usid: "usid",
  hint: "hint",
};

const mockPromise = (returnValue) => {
    return new Promise((resolve) => {
        resolve(returnValue);
    });
}

const createMockSlasClient = () => {
    const mockSlasClient = sinon.createStubInstance(ShopperLogin);
    mockSlasClient.clientConfig = clientConfig;
    mockSlasClient.authenticateCustomer.returns(mockPromise({url}));
    mockSlasClient.getAccessToken.returns(mockPromise(expectedTokenResponse));
    mockSlasClient.logoutCustomer.returns(mockPromise(expectedTokenResponse));
    return mockSlasClient;
}

beforeEach(() => {
  nock.cleanAll();
});

describe("Create code verifier", () => {
  it("creates 128-character URL-safe string", () => {
    const verifier = slasHelper.createCodeVerifier();
    expect(verifier).to.match(/[A-Za-z0-9_-]{128}/);
  });
});

describe("Generate code challenge", () => {
  const verifier =
    "XVv3DJSzPDdbcVsrcs-4KuUtMYhvd6fxS0Gtbu_gv-UaVKo80w8WKA1gitXhC-DMW0H_mOtUNJhecfTwb-n_dXQWz8Ay6iWZWoeSBPfwgzP_pblgQr4eqodqeYNxfdWv";
  const expectedChallenge = "AH8WaHxbEtoZuFw-rw2YS9SazhKJilGoESoSlICXsQw";

  it("generates correct code challenge for verifier", async () => {
    const challenge = await slasHelper.generateCodeChallenge(verifier);
    expect(challenge).to.be.deep.equal(expectedChallenge);
  });
});

describe("Get code and usid", () => {
  const expectedRecord = {
    code: "J2lHm0cgXmnXpwDhjhLoyLJBoUAlBfxDY-AhjqGMC-o",
    usid: "048adcfb-aa93-4978-be9e-09cb569fdcb9",
  };

  const expectedNoQueryParamsRecord = {
    code: "",
    usid: "",
  };

  const noQueryParamsUrl = "https://localhost:3000/callback?";

  it("extracts code and usid from url", () => {
    const record = slasHelper.getCodeAndUsidFromUrl(url);
    expect(record).to.be.deep.equal(expectedRecord);
  });

  it("evaluates code and usid as empty strings when called with no query params", () => {
    const record = slasHelper.getCodeAndUsidFromUrl(noQueryParamsUrl);
    expect(record).to.be.deep.equal(expectedNoQueryParamsRecord);
  });
});

describe("Authorize user", () => {
  const expectedAuthResponse = {
    code: "J2lHm0cgXmnXpwDhjhLoyLJBoUAlBfxDY-AhjqGMC-o",
    url,
    usid: "048adcfb-aa93-4978-be9e-09cb569fdcb9",
  };

  const expectedAuthResponseNoLocation = {
    code: "",
    url: "https://short_code.api.commercecloud.salesforce.com/shopper/auth/v1/organizations/organization_id/oauth2/authorize?client_id=client_id&code_challenge=73oehA2tBul5grZPhXUGQwNAjxh69zNES8bu2bVD0EM&hint=hint&redirect_uri=redirect_uri&response_type=code&usid=usid",
    usid: "usid",
  };

  it("hits the authorize endpoint and receives authorization code", async () => {
    const mockSlasClient = createMockSlasClient();
    const { shortCode, organizationId } = clientConfig.parameters;

    // slasClient is copied and tries to make an actual API call
    nock(`https://${shortCode}.api.commercecloud.salesforce.com`)
      .get(`/shopper/auth/v1/organizations/${organizationId}/oauth2/authorize`)
      .query(true)
      .reply(303, { response_body: "response_body" }, { location: url });

    const authResponse = await slasHelper.authorize(
      mockSlasClient,
      codeVerifier,
      parameters
    );
    expect(authResponse).to.be.deep.equal(expectedAuthResponse);
  });

  it("uses response.url if location header is unavailable", async () => {
    const mockSlasClient = createMockSlasClient();
    const { shortCode, organizationId } =
      mockSlasClient.clientConfig.parameters;

    nock(`https://${shortCode}.api.commercecloud.salesforce.com`)
      .get(`/shopper/auth/v1/organizations/${organizationId}/oauth2/authorize`)
      .query(true)
      .reply(200, { response_body: "response_body" }, { location: "" });

    const authResponse = await slasHelper.authorize(
      mockSlasClient,
      codeVerifier,
      parameters
    );
    expect(authResponse).to.be.deep.equals(expectedAuthResponseNoLocation);
  });
});

describe("Guest user flow", () => {
  const expectedOptions = {
    headers: {
      Authorization: 'Basic Y2xpZW50X2lkOmNsaWVudF9zZWNyZXQ=',
    },
    body: {
      grant_type: "client_credentials",
    },
  };

  it("uses client secret to generate access token", async () => {
    const mockSlasClient = createMockSlasClient();
    const { shortCode, organizationId } =
      mockSlasClient.clientConfig.parameters;

    nock(`https://${shortCode}.api.commercecloud.salesforce.com`)
      .get(`/shopper/auth/v1/organizations/${organizationId}/oauth2/authorize`)
      .query(true)
      .reply(200, { response_body: "response_body" });

    const accessToken = await slasHelper.loginGuestUser(
      mockSlasClient,
      { clientSecret: credentials.clientSecret }
    );

    expect(mockSlasClient.getAccessToken.getCall(0).args[0]).to.be.deep.equals(expectedOptions);
    expect(accessToken).to.be.deep.equals(expectedTokenResponse);
  });
});

describe("Registered B2C user flow", () => {

  it("hits login and token endpoints to generate JWT", async () => {
    const mockSlasClient = createMockSlasClient();
    const { shortCode, organizationId } = mockSlasClient.clientConfig.parameters;
    nock(`https://${shortCode}.api.commercecloud.salesforce.com`)
      .post(`/shopper/auth/v1/organizations/${organizationId}/oauth2/login`)
      .query(true)
      .reply(303, { response_body: "response_body" });

    nock(`https://${shortCode}.api.commercecloud.salesforce.com`)
      .post(`/shopper/auth/v1/organizations/${organizationId}/oauth2/token`)
      .query(true)
      .reply(200, { response_body: "response_body" });

    const accessToken = await slasHelper.loginRegisteredUserB2C(
      mockSlasClient,
      credentials,
      parameters
    );

    expect(accessToken).to.be.deep.equals(expectedTokenResponse);
  });
});

describe("Refresh Token", () => {
  const expectedBody = {
    body: {
      client_id: "client_id",
      grant_type: "refresh_token",
      refresh_token: "refresh_token",
    },
  };

  it("refreshes the token", async () => {
    const mockSlasClient = createMockSlasClient();
    const token = await slasHelper.refreshAccessToken(
      mockSlasClient,
      parameters
    );

    expect(mockSlasClient.getAccessToken.getCall(0).args[0]).to.be.deep.equals(expectedBody);
    expect(token).to.be.deep.equals(expectedTokenResponse);
  });
});

describe("Logout", () => {
  const expectedOptions = {
    parameters: {
      client_id: "client_id",
      channel_id: "site_id",
      refresh_token: "refresh_token",
    },
  };

  it("logs out the customer", async () => {
    const mockSlasClient = createMockSlasClient();
    const token = await slasHelper.logout(mockSlasClient, parameters);

    expect(mockSlasClient.logoutCustomer.getCall(0).args[0]).to.be.deep.equals(expectedOptions);
    expect(token).to.be.deep.equals(expectedTokenResponse);
  });
});
