/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { decode } from "jsonwebtoken";

import { IAuthScheme } from "./auth-schemes";
import { BaseClient } from "./client";
import { _post } from "./static-client";

/**
 * Decodes token from the server and returns the claims in the JWT.
 * @param authHeader The string beginning with "Bearer " and containing the encoded token.
 */
const decodeJWTFromAuthHeader = (authHeader: string): object =>
  decode(authHeader.split("Bearer ")[1].trim());

export class ShopperJWT implements IAuthScheme {
  public authClient: BaseClient;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public token: any;

  init(client: BaseClient): void {
    this.authClient = new BaseClient({
      baseUri: client.clientConfig.authHost,
      headers: { "x-dw-client-id": client.clientConfig.clientId }
    });
  }

  async injectAuth(
    headers: {
      [key: string]: string;
    } = {}
  ): Promise<{ [key: string]: string }> {
    await this.refresh();

    if (this.token && !("Authorization" in headers)) {
      headers["Authorization"] = this.token.authHeaderString;
    }

    return headers;
  }

  // This is returning true or false because you might want to continue using the client without auth as some endpoints
  // in a context might not have auth or be using a different auth
  async authenticate(client?: BaseClient): Promise<boolean> {
    return false;
  }

  async refresh(): Promise<void> {
    if (!this.token || this.token.decoded.exp < Date.now()) {
      try {
        const response: Response = (await _post({
          client: this.authClient,
          path: "",
          rawResponse: true,
          body: { type: "guest" }
        })) as Response;
        this.token = {
          authHeaderString: response.headers.get("authorization")
        };
        this.token.decoded = decodeJWTFromAuthHeader(
          this.token.authHeaderString
        );
      } catch (error) {
        console.error("Access Token error", error.message);
      }
    }
  }
}
