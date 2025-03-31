/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// tsdoc doesn't support dot notation for @param
/* eslint-disable tsdoc/syntax */

import { nanoid } from "nanoid";
import { URL, URLSearchParams } from "url";
import { ResponseError } from "@commerce-apps/core";
import {
  ISlasClient,
  TokenResponse,
  TokenRequest,
  CustomQueryParameters,
  CustomRequestBody,
  LoginRequest,
} from "./slasClient";
import type { RequestRedirect } from "node-fetch";

/**
 * Converts a string into Base64 encoding
 *
 * @param unencoded - A string to be encoded
 * @returns Base64 encoded string
 */
export const stringToBase64 = (unencoded: string): string =>
  Buffer.from(unencoded).toString("base64");

/**
 * Parse out the code and usid from a redirect url
 *
 * @param urlString - A url that contains `code` and `usid` query parameters, typically returned when calling a Shopper Login endpoint
 * @returns An object containing the code and usid.
 */
export const getCodeAndUsidFromUrl = (
  urlString: string
): { code: string; usid: string } => {
  const url = new URL(urlString);
  const urlParams = new URLSearchParams(url.search);
  const usid = urlParams.get("usid") ?? "";
  const code = urlParams.get("code") ?? "";

  return {
    code,
    usid,
  };
};

/**
 * Creates a random string to use as a code verifier. This code is created by the client and sent with both the authorization request (as a code challenge) and the token request.
 *
 * @returns code verifier
 */
export const createCodeVerifier = (): string => nanoid(128);

/**
 * Encodes a code verifier to a code challenge to send to the authorization endpoint
 *
 * @param codeVerifier - random string to use as a code verifier
 * @returns code challenge
 */
export const generateCodeChallenge = async (
  codeVerifier: string
): Promise<string> => {
  const urlSafe = (input: string) =>
    input.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

  const crypto = await import("crypto");
  const challenge = urlSafe(
    crypto.default.createHash("sha256").update(codeVerifier).digest("base64")
  );

  if (challenge.length === 0) {
    throw new Error("Problem generating code challenge");
  }

  return challenge;
};

/**
 * Wrapper for the authorization endpoint. For federated login (3rd party IDP non-guest), the caller should redirect the user to the url in the url field of the returned object. The url will be the login page for the 3rd party IDP and the user will be sent to the redirectURI on success. Guest sessions return the code and usid directly with no need to redirect.
 *
 * @param slasClient - a configured instance of the ShopperLogin SDK client
 * @param codeVerifier - random string created by client app to use as a secret in the request
 * @param parameters - Request parameters used by the `authorizeCustomer` endpoint.
 * @param parameters.redirectURI - the location the client will be returned to after successful login with 3rd party IDP. Must be registered in SLAS.
 * @param parameters.hint? - optional string to hint at a particular IDP. Guest sessions are created by setting this to 'guest'
 * @param parameters.usid? - optional saved SLAS user id to link the new session to a previous session
 * @param options? - an object containing the options for this function.
 * @returns login url, user id and authorization code if available
 */
export async function authorize(
  slasClient: ISlasClient,
  codeVerifier: string,
  parameters: {
    redirectURI: string;
    hint?: string;
    usid?: string;
  } & CustomQueryParameters
): Promise<{ code: string; url: string; usid: string }> {
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const { hint, redirectURI, usid, ...restOfParams } = parameters;

  const options = {
    parameters: {
      ...restOfParams,
      client_id: slasClient.clientConfig.parameters.clientId,
      code_challenge: codeChallenge,
      ...(hint && { hint }),
      organizationId: slasClient.clientConfig.parameters.organizationId,
      redirect_uri: redirectURI,
      response_type: "code",
      ...(usid && { usid }),
    },
    fetchOptions: {
      // We do not want to redirect to redirectURI so manually control redirect
      redirect: "manual" as RequestRedirect,
    },
  };

  const response = await slasClient.authorizeCustomer(options, true);

  if (response.status !== 303) {
    throw new ResponseError(response);
  }

  const redirectUrl = response.headers?.get("location") || response.url;

  return { url: redirectUrl, ...getCodeAndUsidFromUrl(redirectUrl) };
}

/**
 * A single function to execute the ShopperLogin Private Client Guest Login as described in the [API documentation](https://developer.salesforce.com/docs/commerce/commerce-api/guide/slas-private-client.html).
 *
 * @param slasClient - a configured instance of the ShopperLogin SDK client
 * @param credentials - client secret used for authentication
 * @param credentials.clientSecret - secret associated with client ID
 * @param usid? - optional Unique Shopper Identifier to enable personalization
 * @returns TokenResponse
 */
export async function loginGuestUserPrivate(
  slasClient: ISlasClient,
  credentials: {
    clientSecret: string;
  },
  usid?: string
): Promise<TokenResponse> {
  if (!slasClient.clientConfig.parameters.siteId) {
    throw new Error(
      "Required argument channel_id is not provided through clientConfig.parameters.siteId"
    );
  }

  const authorization = `Basic ${stringToBase64(
    `${slasClient.clientConfig.parameters.clientId}:${credentials.clientSecret}`
  )}`;

  const options = {
    headers: {
      Authorization: authorization,
    },
    body: {
      grant_type: "client_credentials",
      channel_id: slasClient.clientConfig.parameters.siteId,
      ...(usid && { usid: usid }),
    },
  };

  return slasClient.getAccessToken(options);
}

/**
 * A single function to execute the ShopperLogin Public Client Guest Login with proof key for code exchange flow as described in the [API documentation](https://developer.salesforce.com/docs/commerce/commerce-api/guide/slas-public-client.html).
 *
 * @param slasClient a configured instance of the ShopperLogin SDK client.
 * @param parameters - parameters to pass in the API calls.
 * @param parameters.redirectURI - Per OAuth standard, a valid app route. Must be listed in your SLAS configuration. On server, this will not be actually called
 * @param parameters.usid? - Unique Shopper Identifier to enable personalization.
 * @returns TokenResponse
 */
export async function loginGuestUser(
  slasClient: ISlasClient,
  parameters: {
    redirectURI: string;
    usid?: string;
  } & CustomQueryParameters
): Promise<TokenResponse> {
  const codeVerifier = createCodeVerifier();
  const { usid, redirectURI, ...restOfParams } = parameters;

  const authResponse = await authorize(slasClient, codeVerifier, {
    ...restOfParams,
    redirectURI: redirectURI,
    hint: "guest",
    ...(usid && { usid }),
  });

  const tokenBody: TokenRequest = {
    client_id: slasClient.clientConfig.parameters.clientId,
    channel_id: slasClient.clientConfig.parameters.siteId,
    code: authResponse.code,
    code_verifier: codeVerifier,
    grant_type: "authorization_code_pkce",
    redirect_uri: redirectURI,
    usid: authResponse.usid,
  };

  return slasClient.getAccessToken({ body: tokenBody });
}

/**
 * A single function to execute the ShopperLogin Private Client Registered User B2C Login as described in the [API documentation](https://developer.salesforce.com/docs/commerce/commerce-api/guide/slas-private-client.html).
 *
 * @param slasClient - a configured instance of the ShopperLogin SDK client.
 * @param credentials - the shopper username and password for login and client secret for additional authentication
 * @param credentials.username - the id of the user to login with
 * @param credentials.password - the password of the user to login with
 * @param credentials.clientSecret - secret associated with client ID
 * @param parameters - parameters to pass in the API calls.
 * @param parameters.redirectURI - Per OAuth standard, a valid app route. Must be listed in your SLAS configuration. On server, this will not be actually called
 * @param parameters.usid? - optional Unique Shopper Identifier to enable personalization
 * @param options? - optional parameters to pass in the API calls.
 * @param options.body? - optional body to pass in the ShopperLogin authenticateCustomer method
 * @returns TokenResponse
 */
export async function loginRegisteredUserB2Cprivate(
  slasClient: ISlasClient,
  credentials: {
    username: string;
    password: string;
    clientSecret: string;
  },
  parameters: {
    redirectURI: string;
    usid?: string;
  },
  options?: {
    body?: CustomRequestBody;
  }
): Promise<TokenResponse> {
  const codeVerifier = createCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  const authHeaderUserPass = `Basic ${stringToBase64(
    `${credentials.username}:${credentials.password}`
  )}`;

  const optionsLogin = {
    headers: {
      Authorization: authHeaderUserPass,
    },
    body: {
      ...(options?.body || {}),
      code_challenge: codeChallenge,
      channel_id: slasClient.clientConfig.parameters.siteId,
      client_id: slasClient.clientConfig.parameters.clientId,
      redirect_uri: parameters.redirectURI,
      ...(parameters.usid && { usid: parameters.usid }),
    },
    fetchOptions: {
      // We do not want to redirect to redirectURI so manually control redirect
      redirect: "manual" as RequestRedirect,
    },
  };

  const response = await slasClient.authenticateCustomer(optionsLogin, true);

  if (response.status !== 303) {
    throw new ResponseError(response);
  }

  const redirectUrl = response.headers?.get("location") || response.url;
  const authResponse = getCodeAndUsidFromUrl(redirectUrl);

  const authHeaderIdSecret = `Basic ${stringToBase64(
    `${slasClient.clientConfig.parameters.clientId}:${credentials.clientSecret}`
  )}`;

  const optionsToken = {
    headers: {
      Authorization: authHeaderIdSecret,
    },
    body: {
      grant_type: "authorization_code_pkce",
      code_verifier: codeVerifier,
      code: authResponse.code,
      client_id: slasClient.clientConfig.parameters.clientId,
      redirect_uri: parameters.redirectURI,
      ...(parameters.usid && { usid: parameters.usid }),
    },
  };

  return slasClient.getAccessToken(optionsToken);
}

/**
 * A single function to execute the ShopperLogin Private Client Registered User B2C Login with proof key for code exchange flow as described in the [API documentation](https://developer.salesforce.com/docs/commerce/commerce-api/guide/slas-public-client.html).
 *
 * @param slasClient - a configured instance of the ShopperLogin SDK client.
 * @param credentials - the id and password to login with.
 * @param credentials.username - the id of the user to login with.
 * @param credentials.password - the password of the user to login with.
 * @param parameters - parameters to pass in the API calls.
 * @param parameters.redirectURI - Per OAuth standard, a valid app route. Must be listed in your SLAS configuration. On server, this will not be actually called. On browser, this will be called, but ignored.
 * @param parameters.usid? - Unique Shopper Identifier to enable personalization.
 * @param options? - optional parameters to pass in
 * @param options.body? - optional body to pass in the ShopperLogin authenticateCustomer method
 * @returns TokenResponse
 */
export async function loginRegisteredUserB2C(
  slasClient: ISlasClient,
  credentials: {
    username: string;
    password: string;
  },
  parameters: {
    redirectURI: string;
    usid?: string;
  },
  options?: {
    body?: CustomRequestBody;
  }
): Promise<TokenResponse> {
  const codeVerifier = createCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  const authorization = `Basic ${stringToBase64(
    `${credentials.username}:${credentials.password}`
  )}`;

  const opts = {
    headers: {
      Authorization: authorization,
    },
    parameters: {
      organizationId: slasClient.clientConfig.parameters.organizationId,
    },
    body: {
      ...(options?.body || {}),
      redirect_uri: parameters.redirectURI,
      client_id: slasClient.clientConfig.parameters.clientId,
      code_challenge: codeChallenge,
      channel_id: slasClient.clientConfig.parameters.siteId,
      ...(parameters.usid && { usid: parameters.usid }),
    },
    fetchOptions: {
      // We do not want to redirect to redirectURI so manually control redirect
      redirect: "manual" as RequestRedirect,
    },
  };

  const response = await slasClient.authenticateCustomer(opts, true);

  if (response.status !== 303) {
    throw new ResponseError(response);
  }

  const redirectUrl = response.headers?.get("location") || response.url;
  const authResponse = getCodeAndUsidFromUrl(redirectUrl);

  const tokenBody = {
    grant_type: "authorization_code_pkce",
    code_verifier: codeVerifier,
    code: authResponse.code,
    client_id: slasClient.clientConfig.parameters.clientId,
    redirect_uri: parameters.redirectURI,
    usid: authResponse.usid,
  };

  return slasClient.getAccessToken({ body: tokenBody });
}

/**
 * Exchange a refresh token for a new access token.
 *
 * @param slasClient - a configured instance of the ShopperLogin SDK client.
 * @param parameters - parameters to pass in the API calls.
 * @param parameters.refreshToken - a valid refresh token to exchange for a new access token (and refresh token).
 * @returns TokenResponse
 */
export function refreshAccessToken(
  slasClient: ISlasClient,
  parameters: { refreshToken: string }
): Promise<TokenResponse> {
  const body = {
    grant_type: "refresh_token",
    refresh_token: parameters.refreshToken,
    client_id: slasClient.clientConfig.parameters.clientId,
  };

  return slasClient.getAccessToken({ body });
}

/**
 * Exchange a refresh token for a new access token.
 *
 * @param slasClient - a configured instance of the ShopperLogin SDK client.
 * @param credentials - client secret used for authentication
 * @param credentials.clientSecret - secret associated with client ID
 * @param parameters - parameters to pass in the API calls.
 * @param parameters.refreshToken - a valid refresh token to exchange for a new access token (and refresh token).
 * @returns TokenResponse
 */
export function refreshAccessTokenPrivate(
  slasClient: ISlasClient,
  credentials: { clientSecret: string },
  parameters: { refreshToken: string }
): Promise<TokenResponse> {
  const authorization = `Basic ${stringToBase64(
    `${slasClient.clientConfig.parameters.clientId}:${credentials.clientSecret}`
  )}`;
  const options = {
    headers: {
      Authorization: authorization,
    },
    body: {
      grant_type: "refresh_token",
      refresh_token: parameters.refreshToken,
    },
  };
  return slasClient.getAccessToken(options);
}

/**
 * Logout a shopper. The shoppers access token and refresh token will be revoked and if the shopper authenticated with ECOM the OCAPI JWT will also be revoked.
 *
 * @param slasClient - a configured instance of the ShopperLogin SDK client.
 * @param parameters - parameters to pass in the API calls.
 * @param parameters.accessToken - a valid access token to exchange for a new access token (and refresh token).
 * @param parameters.refreshToken - a valid refresh token to exchange for a new access token (and refresh token).
 * @returns TokenResponse
 */
export function logout(
  slasClient: ISlasClient,
  parameters: {
    accessToken: string;
    refreshToken: string;
  }
): Promise<TokenResponse> {
  return slasClient.logoutCustomer({
    headers: {
      Authorization: `Bearer ${parameters.accessToken}`,
    },
    parameters: {
      refresh_token: parameters.refreshToken,
      client_id: slasClient.clientConfig.parameters.clientId,
      channel_id: slasClient.clientConfig.parameters.siteId,
    },
  });
}
