/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { BaseClient } from "./client";
import oauth2, { OAuthClient } from "simple-oauth2";

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

    if (!("Authentication" in headers)) {
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
    if (this.token.expired()) {
      this.token = await this.token.refresh();
    }
  }
}

// This us ugly, but until we have consistent auth scheme naming in raml we need a mapping
export const AuthSchemes = {
  AccountManager: AccountManager,
  clientId: AccountManager
};
