/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { BaseClient } from "./client";
import oauth2, { OAuthClient } from "simple-oauth2";
//Using our own static client for Shopper Auth Token call
import * as ShopperAuthClient from "./static-client";

export interface IAuthScheme {
  // eslint-disable-next-line @typescript-eslint/no-misused-new
  init(client: BaseClient): void;
  authenticate(client?: BaseClient): Promise<boolean>;
  injectAuth(headers: {
    [key: string]: string;
  }): Promise<{ [key: string]: string }>;
}

// Implementing without abstract class for now..
// Once we figure out the non guest workflow, we can refactor this ShopperManager
export class ShopperJWT implements IAuthScheme {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public token: string;
  public shopperClient: BaseClient;
  public baseClient: BaseClient;

  init(client: BaseClient): void {
    this.shopperClient = client;
    this.baseClient = new BaseClient({
      clientId: client.clientConfig.clientId,
      baseUri: client.clientConfig.authHost,
      rawReponse: true
    });
  }

  async injectAuth(headers: {
    [key: string]: string;
  }): Promise<{ [key: string]: string }> {
    await this.refresh();

    headers = headers ? headers : {};

    if (this.token && !("Authentication" in headers)) {
      // Token contains Auth header as "Bearer adsfsdf..."
      // No need to prepend with Bearer
      headers["Authentication"] = `Bearer ${this.token}`;
    }
    return headers;
  }

  // This is returning true or false because you might want to continue using the client without auth as some endpoints
  // in a context might not have auth or be using a different auth
  async authenticate(client?: BaseClient): Promise<boolean> {
    if (client) {
      this.init(client);
    }
    const body = {
      type: "guest"
    };

    const queryParams = {
      // eslint-disable-next-line @typescript-eslint/camelcase
      client_id: this.baseClient.clientConfig.clientId
    };
    try {
      const response = await ShopperAuthClient._post({
        client: this.baseClient,
        path: undefined,
        pathParameters: {},
        queryParameters: queryParams,
        headers: {},
        body: body
      });
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      this.token = response.headers
        .get("authorization")
        .split("Bearer ")[1]
        .trim();
    } catch (error) {
      console.error("ShopperJwt bearer token error", error.message);
      return false;
    }
    return true;
  }

  async refresh(): Promise<void> {
    if (!!!this.token) {
      await this.authenticate();
    }
    return;
  }
}

export class AccountManager implements IAuthScheme {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public oauth2: OAuthClient<any>;
  public token: oauth2.AccessToken;

  init(client: BaseClient): void {
    const credentials = {
      client: {
        id: client.clientConfig.clientId,
        secret: client.clientConfig.clientSecret
      },
      auth: {
        tokenHost: client.clientConfig.authHost,
        tokenPath: "/dwsso/oauth2/access_token"
      }
    };
    this.oauth2 = oauth2.create(credentials);
  }

  async injectAuth(headers: {
    [key: string]: string;
  }): Promise<{ [key: string]: string }> {
    await this.refresh();

    headers = headers ? headers : {};

    if (this.token && !("Authentication" in headers)) {
      headers["Authentication"] = `Bearer ${this.token.token["access_token"]}`;
    }
    return headers;
  }

  // This is returning true or false because you might want to continue using the client without auth as some endpoints
  // in a context might not have auth or be using a different auth
  async authenticate(client?: BaseClient): Promise<boolean> {
    if (client) {
      this.init(client);
    }

    try {
      const result = await this.oauth2.clientCredentials.getToken({});
      this.token = this.oauth2.accessToken.create(result);
    } catch (error) {
      console.error("Access Token error", error.message);
      return false;
    }

    return true;
  }

  async refresh(): Promise<void> {
    if (this.token && this.token.expired()) {
      this.token = await this.token.refresh();
    }
  }
}

// This us ugly, but until we have consistent auth scheme naming in raml we need a mapping
export const AuthSchemes = {
  AccountManager: AccountManager,
  clientId: AccountManager,
  ShopperJWT: ShopperJWT,
  // eslint-disable-next-line @typescript-eslint/camelcase
  OAuth2_0: AccountManager
};
