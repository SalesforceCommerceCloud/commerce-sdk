/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// DEPRECATED FILE!!! DO NOT UPDATE!!!! (Except to remove code)

import * as oauth2 from "simple-oauth2";

import { BaseClient } from "./client";

export interface IAuthScheme {
  // eslint-disable-next-line @typescript-eslint/no-misused-new
  init(client: BaseClient): void;
  authenticate(client?: BaseClient): Promise<boolean>;
  injectAuth(headers: {
    [key: string]: string;
  }): Promise<{ [key: string]: string }>;
}

export class AccountManager implements IAuthScheme {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public oauth2Client: oauth2.OAuthClient<any>;
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
    this.oauth2Client = oauth2.create(credentials);
  }

  async injectAuth(headers: {
    [key: string]: string;
  }): Promise<{ [key: string]: string }> {
    headers = headers ? headers : {};

    if (!("Authentication" in headers)) {
      await this.refresh();
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
      const result = await this.oauth2Client.clientCredentials.getToken({});
      this.token = this.oauth2Client.accessToken.create(result);
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
  AccountManager: AccountManager
};
