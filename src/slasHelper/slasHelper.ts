/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {nanoid} from 'nanoid';
import {ShopperLogin} from '../../renderedTemplates/customer/shopperLogin/shopperLogin';

export const stringToBase64 = (unencoded: string): string => Buffer.from(unencoded).toString('base64');

/**
 * Parse out the code and usid from a redirect url
 * @param urlString A url that contains `code` and `usid` query parameters, typically returned when calling a Shopper Login endpoint
 * @returns An object containing the code and usid.
 */
export const getCodeAndUsidFromUrl = (
  urlString: string
): {code: string; usid: string} => {
  const url = new URL(urlString);
  const urlParams = new URLSearchParams(url.search);
  const usid = urlParams.get('usid') ?? '';
  const code = urlParams.get('code') ?? '';

  return {
    code,
    usid,
  };
};

/**
 * Creates a random string to use as a code verifier. This code is created by the client and sent with both the authorization request (as a code challenge) and the token request.
 * @returns code verifier
 */
export const createCodeVerifier = (): string => nanoid(128);

/**
 * Encodes a code verifier to a code challenge to send to the authorization endpoint
 * @param codeVerifier random string to use as a code verifier
 * @returns code challenge
 */
export const generateCodeChallenge = async (
  codeVerifier: string
): Promise<string> => {
    const urlSafe = (input: string) =>
        input.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    const crypto = await import('crypto');
    const challenge = urlSafe(
        crypto.default.createHash('sha256').update(codeVerifier).digest('base64')
    );

    /* istanbul ignore next */
    if (challenge.length === 0) {
    throw new Error('Problem generating code challenge');
    }

    return challenge;
};

/**
 * Wrapper for the authorization endpoint. For federated login (3rd party IDP non-guest), the caller should redirect the user to the url in the url field of the returned object. The url will be the login page for the 3rd party IDP and the user will be sent to the redirectURI on success. Guest sessions return the code and usid directly with no need to redirect.
 * @param slasClient a configured instance of the ShopperLogin SDK client
 * @param codeVerifier - random string created by client app to use as a secret in the request
 * @param parameters - Request parameters used by the `authorizeCustomer` endpoint.
 * @param parameters.redirectURI - the location the client will be returned to after successful login with 3rd party IDP. Must be registered in SLAS.
 * @param parameters.hint? - optional string to hint at a particular IDP. Guest sessions are created by setting this to 'guest'
 * @param parameters.usid? - optional saved SLAS user id to link the new session to a previous session
 * @returns login url, user id and authorization code if available
 */
export async function authorize(
  slasClient: ShopperLogin,
  codeVerifier: string,
  parameters: {
    redirectURI: string;
    hint?: string;
    usid?: string;
  }
): Promise<{code: string; url: string; usid: string}> {
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Create a copy to override specific fetchOptions
  const slasClientCopy = new ShopperLogin(slasClient.clientConfig);

  // set manual redirect on server since node allows access to the location
  // header and it skips the extra call. In the browser, only the default
  // follow setting allows us to get the url.

  // TODO: pass redirect manual as a fetch option

  // slasClientCopy.clientConfig.fetchOptions = {
  //   ...slasClient.clientConfig.fetchOptions,
  //   redirect: 'manual',
  // };

  const options = {
    parameters: {
      client_id: slasClient.clientConfig.parameters.clientId,
      code_challenge: codeChallenge,
      ...(parameters.hint && {hint: parameters.hint}),
      organizationId: slasClient.clientConfig.parameters.organizationId,
      redirect_uri: parameters.redirectURI,
      response_type: 'code',
      ...(parameters.usid && {usid: parameters.usid}),
    },
  };

  const response = await slasClientCopy.authorizeCustomer(options, true);
  const redirectUrl = response.headers?.get('location') || response.url;

  // url is a read only property we unfortunately cannot mock out using nock
  // meaning redirectUrl will not have a falsy value for unit tests
  /* istanbul ignore next */
  if (!redirectUrl) {
    throw new Error('Authorization failed');
  }

  return {url: redirectUrl, ...getCodeAndUsidFromUrl(redirectUrl)};
}

/**
 * A single function to execute the ShopperLogin Public Client Guest Login with proof key for code exchange flow as described in the [API documentation](https://developer.salesforce.com/docs/commerce/commerce-api/references?meta=shopper-login-and-api-access:Summary).
 * @param slasClient a configured instance of the ShopperLogin SDK client.
 * @param parameters - parameters to pass in the API calls.
 * @param parameters.redirectURI - Per OAuth standard, a valid app route. Must be listed in your SLAS configuration. On server, this will not be actually called. On browser, this will be called, but ignored.
 * @param parameters.usid? - Unique Shopper Identifier to enable personalization.
 * @returns TokenResponse
 */
export async function loginGuestUser(
  slasClient: ShopperLogin,
  parameters: {
    redirectURI: string;
    usid?: string;
  }
): Promise<ShopperLogin.TokenResponse> {
  const codeVerifier = createCodeVerifier();

  const authResponse = await authorize(slasClient, codeVerifier, {
    redirectURI: parameters.redirectURI,
    hint: 'guest',
    ...(parameters.usid && {usid: parameters.usid}),
  });

  const tokenBody: ShopperLogin.TokenRequest = {
    client_id: slasClient.clientConfig.parameters.clientId,
    code: authResponse.code,
    code_verifier: codeVerifier,
    grant_type: 'authorization_code_pkce',
    redirect_uri: parameters.redirectURI,
    usid: authResponse.usid,
  };

  return slasClient.getAccessToken({body: tokenBody});
}

/**
 * A single function to execute the ShopperLogin Public Client Registered User B2C Login with proof key for code exchange flow as described in the [API documentation](https://developer.salesforce.com/docs/commerce/commerce-api/references?meta=shopper-login-and-api-access:Summary).
 * @param slasClient a configured instance of the ShopperLogin SDK client.
 * @param credentials - the id and password to login with.
 * @param credentials.username - the id of the user to login with.
 * @param credentials.password - the password of the user to login with.
 * @param parameters - parameters to pass in the API calls.
 * @param parameters.redirectURI - Per OAuth standard, a valid app route. Must be listed in your SLAS configuration. On server, this will not be actually called. On browser, this will be called, but ignored.
 * @param parameters.usid? - Unique Shopper Identifier to enable personalization.
 * @returns TokenResponse
 */
export async function loginRegisteredUserB2C(
  slasClient: ShopperLogin,
  credentials: {
    username: string;
    password: string;
  },
  parameters: {
    redirectURI: string;
    usid?: string;
  }
): Promise<ShopperLogin.TokenResponse> {
  const codeVerifier = createCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  const authorization = `Basic ${stringToBase64(
    `${credentials.username}:${credentials.password}`
  )}`;

  const options = {
    headers: {
      Authorization: authorization,
    },
    parameters: {
      organizationId: slasClient.clientConfig.parameters.organizationId,
    },
    body: {
      redirect_uri: parameters.redirectURI,
      client_id: slasClient.clientConfig.parameters.clientId,
      code_challenge: codeChallenge,
      channel_id: slasClient.clientConfig.parameters.siteId,
      ...(parameters.usid && {usid: parameters.usid}),
    },
  };

  const response = await slasClient.authenticateCustomer(options, true);

  const authResponse = getCodeAndUsidFromUrl(response.url);

  const tokenBody = {
    client_id: slasClient.clientConfig.parameters.clientId,
    code: authResponse.code,
    code_verifier: codeVerifier,
    grant_type: 'authorization_code_pkce',
    organizationId: slasClient.clientConfig.parameters.organizationId,
    redirect_uri: parameters.redirectURI,
    usid: authResponse.usid,
  };

  return slasClient.getAccessToken({body: tokenBody});
}

/**
 * Exchange a refresh token for a new access token.
 * @param slasClient a configured instance of the ShopperLogin SDK client.
 * @param parameters - parameters to pass in the API calls.
 * @param parameters.refreshToken - a valid refresh token to exchange for a new access token (and refresh token).
 * @returns TokenResponse
 */
export function refreshAccessToken(
  slasClient: ShopperLogin,
  parameters: {refreshToken: string}
): Promise<ShopperLogin.TokenResponse> {
  const body = {
    grant_type: 'refresh_token',
    refresh_token: parameters.refreshToken,
    client_id: slasClient.clientConfig.parameters.clientId,
  };

  return slasClient.getAccessToken({body});
}

/**
 * Logout a shopper. The shoppers access token and refresh token will be revoked and if the shopper authenticated with ECOM the OCAPI JWT will also be revoked.
 * @param slasClient a configured instance of the ShopperLogin SDK client.
 * @param parameters - parameters to pass in the API calls.
 * @param parameters.refreshToken - a valid refresh token to exchange for a new access token (and refresh token).
 * @returns TokenResponse
 */
export function logout(
  slasClient: ShopperLogin,
  parameters: {refreshToken: string}
): Promise<ShopperLogin.TokenResponse> {
  return slasClient.logoutCustomer({
    parameters: {
      refresh_token: parameters.refreshToken,
      client_id: slasClient.clientConfig.parameters.clientId,
      channel_id: slasClient.clientConfig.parameters.siteId,
    },
  });
}
