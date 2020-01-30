/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { decode } from "jsonwebtoken";
import { IAuthHelper } from "./auth-helper";

/**
 * Implements ShopperJWT auth scheme. Gets ShopperJWT Bearer tokens of type
 * `guest` and `credentials`.
 *
 * @public
 */
export class ShopperJWTHelper implements IAuthHelper {
  public authToken: string;

  /**
   * Initializes the object with client and ShopperJWT config. If
   * shopperJWTConfig is not provided, `guest` AuthRequestType is used for
   * obtaining Bearer tokens.
   *
   * @param client Client config to be used for make http calls
   * @param shopperJWTConfig ShopperJWT config to be used for fetching tokens
   */
  constructor(authToken: string) {
    this.authToken = authToken;
  }

  /**
   * Sets and returns the Authorization header with a valid Bearer token.
   * Doesn't do anything if an Authorization header is already present.
   *
   * @returns Authentication token
   */
  getAuthToken(): string {
    return this.authToken;
  }
}
