/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import nock from "nock";
import { expect } from "chai";
import { ShopperLogin } from "../../../renderedTemplates/customer/shopperLogin/shopperLogin";
import { ISlasClient } from "./slasClient";
import * as slasHelper from "./slas";
import sinon from "sinon";
import { URL } from "url";
import { CommonParameters } from "@commerce-apps/core";
import crypto from "crypto";

const codeVerifier = "code_verifier";
const mockURL =
  "https://localhost:3000/callback?usid=048adcfb-aa93-4978-be9e-09cb569fdcb9&code=J2lHm0cgXmnXpwDhjhLoyLJBoUAlBfxDY-AhjqGMC-o";

const clientConfig = {
  parameters: {
    shortCode: "short_code",
    organizationId: "organization_id",
    clientId: "client_id",
    siteId: "site_id",
  },
};

const credentials = {
  username: "shopper_user_id",
  password: "shopper_password",
  clientSecret: "client_secret",
};

const expectedTokenResponse: ShopperLogin.TokenResponse = {
  access_token: "access_token",
  id_token: "id_token",
  refresh_token: "refresh_token",
  expires_in: 0,
  refresh_token_expires_in: 0,
  token_type: "token_type",
  usid: "usid",
  customer_id: "customer_id",
  enc_user_id: "enc_user_id",
  idp_access_token: "idp_access_token",
};

const parameters = {
  accessToken: "access_token",
  hint: "hint",
  redirectURI: "redirect_uri",
  refreshToken: "refresh_token",
  usid: "usid",
};

const createSlasClient = (): ISlasClient => {
  return new ShopperLogin(clientConfig);
};

const sandbox = sinon.createSandbox();

beforeEach(() => {
  nock.cleanAll();
  sandbox.restore();
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

  it("throws error when code challenge is not generated correctly", async () => {
    sandbox.stub(crypto, "createHash").callsFake(() => {
      return {
        update: () => ({
          digest: () => "",
        }),
      } as any;
    });

    let expectedError;
    try {
      await slasHelper.generateCodeChallenge(verifier);
    } catch (error) {
      expectedError = error;
    }
    expect(expectedError?.message).to.be.equal(
      "Problem generating code challenge"
    );
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
    const record = slasHelper.getCodeAndUsidFromUrl(mockURL);
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
    url: mockURL,
    usid: "048adcfb-aa93-4978-be9e-09cb569fdcb9",
  };

  const expectedAuthResponseNoLocation = {
    code: "",
    url: "https://short_code.api.commercecloud.salesforce.com/shopper/auth/v1/organizations/organization_id/oauth2/authorize?client_id=client_id&code_challenge=73oehA2tBul5grZPhXUGQwNAjxh69zNES8bu2bVD0EM&hint=hint&redirect_uri=redirect_uri&response_type=code&usid=usid",
    usid: "usid",
  };

  it("hits the authorize endpoint and receives authorization code", async () => {
    const mockSlasClient = createSlasClient();
    const { shortCode, organizationId } = clientConfig.parameters;

    // slasClient is copied and tries to make an actual API call
    nock(`https://${shortCode}.api.commercecloud.salesforce.com`)
      .get(`/shopper/auth/v1/organizations/${organizationId}/oauth2/authorize`)
      .query(true)
      .reply(303, { response_body: "response_body" }, { location: mockURL });

    const authResponse = await slasHelper.authorize(
      mockSlasClient,
      codeVerifier,
      parameters
    );
    expect(authResponse).to.be.deep.equal(expectedAuthResponse);
  });

  it("uses response.url if location header is unavailable", async () => {
    const mockSlasClient = createSlasClient();
    const { shortCode, organizationId } = mockSlasClient.clientConfig
      .parameters as CommonParameters;

    nock(`https://${shortCode}.api.commercecloud.salesforce.com`)
      .get(`/shopper/auth/v1/organizations/${organizationId}/oauth2/authorize`)
      .query(true)
      .reply(303, { response_body: "response_body" }, { location: "" });

    const authResponse = await slasHelper.authorize(
      mockSlasClient,
      codeVerifier,
      parameters
    );

    const authURL = new URL(authResponse.url);
    const expectedURL = new URL(expectedAuthResponseNoLocation.url);

    expect(authURL.origin).to.equal(expectedURL.origin);
    expect(authURL.pathname).to.equal(expectedURL.pathname);
    expect(authURL.searchParams).to.deep.equal(expectedURL.searchParams);
  });

  it("throws an error when authorization fails", async () => {
    const mockSlasClient = createSlasClient();
    const { shortCode, organizationId } = mockSlasClient.clientConfig
      .parameters as CommonParameters;

    nock(`https://${shortCode}.api.commercecloud.salesforce.com`)
      .get(`/shopper/auth/v1/organizations/${organizationId}/oauth2/authorize`)
      .query(true)
      .reply(400);

    await slasHelper
      .authorize(mockSlasClient, codeVerifier, parameters)
      .catch((error) => expect(error.message).to.be.equal("400 Bad Request"));
  });
});

describe("Guest user flow", () => {
  const expectedOptionsPrivate = {
    headers: {
      Authorization: "Basic Y2xpZW50X2lkOmNsaWVudF9zZWNyZXQ=",
    },
    body: {
      grant_type: "client_credentials",
    },
  };

  const expectedOptionsPublic = {
    body: {
      client_id: "client_id",
      code: "",
      redirect_uri: "redirect_uri",
      grant_type: "authorization_code_pkce",
      usid: "",
    },
  };

  it("using a private client takes in a client secret to generate token", async () => {
    const mockSlasClient = createSlasClient();
    const spy = sinon.spy(mockSlasClient, "getAccessToken");
    const { shortCode, organizationId } = mockSlasClient.clientConfig
      .parameters as CommonParameters;

    nock(`https://${shortCode}.api.commercecloud.salesforce.com`)
      .post(`/shopper/auth/v1/organizations/${organizationId}/oauth2/token`)
      .query(true)
      .reply(200, expectedTokenResponse);

    const accessToken = await slasHelper.loginGuestUserPrivate(mockSlasClient, {
      clientSecret: credentials.clientSecret,
    });

    expect(spy.getCall(0).args[0]).to.be.deep.equals(expectedOptionsPrivate);

    expect(accessToken).to.be.deep.equals(expectedTokenResponse);
  });

  it("using a public client uses a code verifier and code challenge to generate token", async () => {
    const mockSlasClient = createSlasClient();
    const spy = sinon.spy(mockSlasClient, "getAccessToken");
    const { shortCode, organizationId } = mockSlasClient.clientConfig
      .parameters as CommonParameters;

    nock(`https://${shortCode}.api.commercecloud.salesforce.com`)
      .get(`/shopper/auth/v1/organizations/${organizationId}/oauth2/authorize`)
      .query(true)
      .reply(303, { response_body: "response_body" });

    nock(`https://${shortCode}.api.commercecloud.salesforce.com`)
      .post(`/shopper/auth/v1/organizations/${organizationId}/oauth2/token`)
      .query(true)
      .reply(200, expectedTokenResponse);

    const accessToken = await slasHelper.loginGuestUser(mockSlasClient, {
      redirectURI: parameters.redirectURI,
    });

    const options = spy.getCall(0).args[0];

    // have to match object since code_verifier is randomly generated
    sinon.assert.match(options, expectedOptionsPublic);
    expect(options.body).to.include.keys("code_verifier");
    expect(accessToken).to.be.deep.equals(expectedTokenResponse);
  });
});

describe("Registered B2C user flow", () => {
  it("using a private client uses hits login and token endpoints to generate JWT", async () => {
    const mockSlasClient = createSlasClient();
    const { shortCode, organizationId } = mockSlasClient.clientConfig
      .parameters as CommonParameters;
    nock(`https://${shortCode}.api.commercecloud.salesforce.com`)
      .post(`/shopper/auth/v1/organizations/${organizationId}/oauth2/login`)
      .query(true)
      .reply(303, { response_body: "response_body" });

    nock(`https://${shortCode}.api.commercecloud.salesforce.com`)
      .post(`/shopper/auth/v1/organizations/${organizationId}/oauth2/token`)
      .query(true)
      .reply(200, expectedTokenResponse);

    const accessToken = await slasHelper.loginRegisteredUserB2Cprivate(
      mockSlasClient,
      credentials,
      parameters
    );
    expect(accessToken).to.be.deep.equals(expectedTokenResponse);
  });

  it("using a public client uses hits login and token endpoints to generate JWT", async () => {
    const mockSlasClient = createSlasClient();
    const { shortCode, organizationId } = mockSlasClient.clientConfig
      .parameters as CommonParameters;
    nock(`https://${shortCode}.api.commercecloud.salesforce.com`)
      .post(`/shopper/auth/v1/organizations/${organizationId}/oauth2/login`)
      .query(true)
      .reply(303, { response_body: "response_body" }, { location: mockURL });

    nock(`https://${shortCode}.api.commercecloud.salesforce.com`)
      .post(`/shopper/auth/v1/organizations/${organizationId}/oauth2/token`)
      .query(true)
      .reply(200, expectedTokenResponse);

    const accessToken = await slasHelper.loginRegisteredUserB2C(
      mockSlasClient,
      credentials,
      parameters
    );

    expect(accessToken).to.be.deep.equals(expectedTokenResponse);
  });

  it("throws an error when login is unsuccessful for public", async () => {
    const mockSlasClient = createSlasClient();
    const { shortCode, organizationId } = mockSlasClient.clientConfig
      .parameters as CommonParameters;
    nock(`https://${shortCode}.api.commercecloud.salesforce.com`)
      .post(`/shopper/auth/v1/organizations/${organizationId}/oauth2/login`)
      .query(true)
      .reply(400);

    await slasHelper
      .loginRegisteredUserB2C(mockSlasClient, credentials, parameters)
      .catch((error) => expect(error.message).to.be.equal("400 Bad Request"));
  });

  it("throws an error when login is unsuccessful for private", async () => {
    const mockSlasClient = createSlasClient();
    const { shortCode, organizationId } = mockSlasClient.clientConfig
      .parameters as CommonParameters;
    nock(`https://${shortCode}.api.commercecloud.salesforce.com`)
      .post(`/shopper/auth/v1/organizations/${organizationId}/oauth2/login`)
      .query(true)
      .reply(400);

    await slasHelper
      .loginRegisteredUserB2Cprivate(mockSlasClient, credentials, parameters)
      .catch((error) => expect(error.message).to.be.equal("400 Bad Request"));
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

  const expectedOptions = {
    headers: {
      Authorization: "Basic Y2xpZW50X2lkOmNsaWVudF9zZWNyZXQ=",
    },
    body: {
      grant_type: "refresh_token",
      refresh_token: parameters.refreshToken,
    },
  };

  it("refreshes the token", async () => {
    const mockSlasClient = createSlasClient();
    const spy = sinon.spy(mockSlasClient, "getAccessToken");
    const { shortCode, organizationId } = clientConfig.parameters;

    nock(`https://${shortCode}.api.commercecloud.salesforce.com`)
      .post(`/shopper/auth/v1/organizations/${organizationId}/oauth2/token`)
      .query(true)
      .reply(200, expectedTokenResponse);

    const token = await slasHelper.refreshAccessToken(
      mockSlasClient,
      parameters
    );

    expect(spy.getCall(0).args[0]).to.be.deep.equals(expectedBody);
    expect(token).to.be.deep.equals(expectedTokenResponse);
  });

  it("refreshes the token using client secret", async () => {
    const mockSlasClient = createSlasClient();
    const spy = sinon.spy(mockSlasClient, "getAccessToken");
    const { shortCode, organizationId } = clientConfig.parameters;

    nock(`https://${shortCode}.api.commercecloud.salesforce.com`)
      .post(`/shopper/auth/v1/organizations/${organizationId}/oauth2/token`)
      .query(true)
      .reply(200, expectedTokenResponse);

    const token = await slasHelper.refreshAccessTokenPrivate(
      mockSlasClient,
      credentials,
      parameters
    );

    expect(spy.getCall(0).args[0]).to.be.deep.equals(expectedOptions);
    expect(token).to.be.deep.equals(expectedTokenResponse);
  });
});

describe("Logout", () => {
  const expectedOptions = {
    headers: {
      Authorization: "Bearer access_token",
    },
    parameters: {
      client_id: "client_id",
      channel_id: "site_id",
      refresh_token: "refresh_token",
    },
  };

  it("logs out the customer", async () => {
    const mockSlasClient = createSlasClient();
    const spy = sinon.spy(mockSlasClient, "logoutCustomer");
    const { shortCode, organizationId } = clientConfig.parameters;

    nock(`https://${shortCode}.api.commercecloud.salesforce.com`)
      .get(`/shopper/auth/v1/organizations/${organizationId}/oauth2/logout`)
      .query(true)
      .reply(200, expectedTokenResponse);

    const token = await slasHelper.logout(mockSlasClient, parameters);
    expect(spy.getCall(0).args[0]).to.be.deep.equals(expectedOptions);
    expect(token).to.be.deep.equals(expectedTokenResponse);
  });
});
