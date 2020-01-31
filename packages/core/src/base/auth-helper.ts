/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { decode } from "jsonwebtoken";

export interface IAuthToken {
  getAuthToken(): string;
}

export function stripBearer(header: string): string {
  return header.replace("Bearer ", "").trim();
}

/**
 * Implements ShopperJWT auth scheme. Gets ShopperJWT Bearer tokens of type
 * `guest` and `credentials`.
 *
 * @public
 */
export class ShopperToken implements IAuthToken {
  public rawToken: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public decodedToken: { [key: string]: any } | string;

  constructor(token: string) {
    this.rawToken = token;
    this.decodedToken = decode(this.rawToken);
  }

  getAuthToken(): string {
    return this.rawToken;
  }
}
