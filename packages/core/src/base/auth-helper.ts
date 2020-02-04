/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { decode } from "jsonwebtoken";

/**
 * @description A public interface for auth tokens
 * @export
 * @interface IAuthToken
 */
export interface IAuthToken {
  getAuthToken(): string;
}

/**
 * @description
 * @export
 * @param {string} header
 * @returns {string}
 */
export function stripBearer(header: string): string {
  return header.replace("Bearer ", "").trim();
}

/**
 *
 * @description Implements ShopperJWT auth scheme. Gets ShopperJWT Bearer tokens of type
 * `guest` and `credentials`.
 * @export
 * @class ShopperToken
 * @implements {IAuthToken}
 */
export class ShopperToken implements IAuthToken {
  public rawToken: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public decodedToken: { [key: string]: any } | string;

  constructor(token: string) {
    this.rawToken = token;
    this.decodedToken = decode(this.rawToken);
  }

  /**
   * @description Returns the JWT Token
   * @returns {string} JWT Token
   * @memberof ShopperToken
   */
  getAuthToken(): string {
    return this.rawToken;
  }

  /**
   * @description Returns a string with 'Bearer' To be used directly in an authorization header
   * @returns {string}
   * @memberof ShopperToken
   */
  getBearerHeader(): string {
    return `Bearer ${this.rawToken}`;
  }
}
