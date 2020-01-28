/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { decode } from "jsonwebtoken";
import _ from "lodash";

import { IAuthScheme } from "./auth-schemes";
import { BaseClient } from "./client";
import { _post, ResponseError } from "./static-client";

/**
 * Decodes token from the server and returns the claims in the JWT.
 * @param authHeader The string beginning with "Bearer " and containing the encoded token.
 */
const decodeJWTFromAuthHeader = (authHeader: string): object =>
  decode(authHeader.split("Bearer ")[1].trim());

const hstsOptions = "max-age=31536000; includeSubDomains"; // 31536000 = 1 year

/**
 * Supported Authentication request types.
 *
 * Note: Other valid types which are not currently supported are - session and refresh
 */
export enum AuthRequestType {
  Guest = "guest",
  Credentials = "credentials"
}

/**
 * Shopper credentials and request type to be used for getting a ShopperJWT.
 * Username and password are required if the request type is `credentials`, not
 * required for `guest`.
 */
export class ShopperJWTConfig {
  constructor(
    public username = "",
    public password = "",
    public authRequestType = AuthRequestType.Guest
  ) {}

  /**
   * Returns an Authorization header with Basic Auth for AuthRequestType of
   * type `guest`
   *
   * @returns  Authorization header with Basic Auth
   */
  toAuthHeader(): { [key: string]: string } {
    let authHeader = {};
    if (this.authRequestType == AuthRequestType.Credentials) {
      const basicAuth = Buffer.from(
        `${this.username}:${this.password}`
      ).toString("base64");
      authHeader = { Authorization: `Basic ${basicAuth}` };
    }

    return authHeader;
  }
}

/**
 * Implements ShopperJWT auth scheme. Gets ShopperJWT Bearer tokens of type
 * `guest` and `credentials`.
 *
 * @public
 */
export class ShopperJWT implements IAuthScheme {
  public authClient: BaseClient;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public token: any;
  public authRequestType: AuthRequestType;

  /**
   * Initializes the object with client and ShopperJWT config. If
   * shopperJWTConfig is not provided, `guest` AuthRequestType is used for
   * obtaining Bearer tokens.
   *
   * @param client Client config to be used for make http calls
   * @param shopperJWTConfig ShopperJWT config to be used for fetching tokens
   */
  init(client: BaseClient, shopperJWTConfig?: ShopperJWTConfig): void {
    this.authClient = new BaseClient({
      baseUri: client.clientConfig.authHost,
      headers: {
        "x-dw-client-id": client.clientConfig.clientId,
        "Strict-Transport-Security": hstsOptions // Enforces https
      }
    });

    shopperJWTConfig = shopperJWTConfig
      ? shopperJWTConfig
      : new ShopperJWTConfig();
    this.authRequestType = shopperJWTConfig.authRequestType;
    _.merge(
      this.authClient.clientConfig.headers,
      shopperJWTConfig.toAuthHeader()
    );
  }

  /**
   * Sets and returns the Authorization header with a valid Bearer token.
   * Doesn't do anything if an Authorization header is already present.
   *
   * @param headers
   */
  async injectAuth(
    headers: {
      [key: string]: string;
    } = {}
  ): Promise<{ [key: string]: string }> {
    if (!("Authorization" in headers)) {
      await this.refresh();
      headers["Authorization"] = this.token.authHeaderString;
    }

    return headers;
  }

  // This is returning true or false because you might want to continue using the client without auth as some endpoints
  // in a context might not have auth or be using a different auth
  async authenticate(client?: BaseClient): Promise<boolean> {
    return false;
  }

  /**
   * Fetches a Bearer token if not fetched already or if the existing token has
   * expired. The token is fetched from the baseUri provided during
   * initialization.
   *
   * @returns A void promise
   */
  async refresh(): Promise<void> {
    if (!this.token || this.token.decoded.exp < Math.floor(Date.now() / 1000)) {
      const options = {
        client: this.authClient,
        path: "",
        rawResponse: true,
        body: { type: this.authRequestType }
      };

      const response: Response = (await _post(options)) as Response;
      if (!response.ok) {
        throw new ResponseError(response);
      }
      this.token = {
        authHeaderString: response.headers.get("authorization")
      };
      this.token.decoded = decodeJWTFromAuthHeader(this.token.authHeaderString);
    }
  }
}
