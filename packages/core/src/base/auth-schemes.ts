/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// DEPRECATED FILE!!! DO NOT UPDATE!!!! (Except to remove code)

import { BaseClient } from "./client";

export interface IAuthScheme {
  init(client: BaseClient): void;
  authenticate(client?: BaseClient): Promise<boolean>;
  injectAuth(headers: {
    [key: string]: string;
  }): Promise<{ [key: string]: string }>;
}
