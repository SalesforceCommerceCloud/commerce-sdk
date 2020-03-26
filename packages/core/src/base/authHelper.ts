/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { decode } from "jsonwebtoken";

/**
 * A public interface for auth tokens.
 * 
 * @interface IAuthToken
 */
export interface IAuthToken {
  getAuthToken(): string;
}

/**
 * Strip "Bearer " from the passed header.
 * 
 * @param {string} header - A Bearer token
 * @returns {string} The token after stripping "Bearer "
 */
export function stripBearer(header: string): string {
  return header.replace("Bearer ", "").trim();
}

/**
 * Implements ShopperJWT auth scheme. Gets ShopperJWT Bearer tokens of type
 * `guest` and `credentials`.
 * 
 * @class ShopperToken
 * @implements {IAuthToken}
 */
export class ShopperToken<T> implements IAuthToken {
  public rawToken: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public decodedToken: { [key: string]: any } | string;
  public customerInfo: T;

  constructor(dto: T, token: string) {
    this.rawToken = token;
    this.decodedToken = decode(this.rawToken);
    this.customerInfo = dto;
  }

  /**
   * Returns the JWT.
   * 
   * @returns {string} JWT
   * 
   * @memberof ShopperToken
   */
  getAuthToken(): string {
    return this.rawToken;
  }

  /**
   * Returns a Bearer token i.e. `Bearer <JWT>`.
   * 
   * @returns {string} The JWT with "Bearer " added to the front
   * 
   * @memberof ShopperToken
   */
  getBearerHeader(): string {
    return `Bearer ${this.rawToken}`;
  }

  /**
   * Retrieves the customer information.
   * 
   * @returns Customer information this object is instantiated with
   */
  getCustomerInfo(): T {
    return this.customerInfo;
  }
}
