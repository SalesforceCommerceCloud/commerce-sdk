/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as os from "os";
import * as path from "path";

import { config } from "dotenv";
import { getBearer } from "@commerce-sdk/exchange-connector";
import _ from "lodash";
import tmp from "tmp";

import { DefaultCache } from "./static-client";
export { DefaultCache };
import { IAuthScheme } from "./auth-schemes";
import { ICacheManager } from "./cache-manager";

// dotenv config loads environmental variables.
config();

export type ClientConfig = {
  authHost?: string;
  baseUri?: string;
  cacheManager?: ICacheManager;
  clientId?: string;
  clientSecret?: string;
  headers?: { [key: string]: string };
};

const DEFAULT_CLIENT_CONFIG: ClientConfig = {
  authHost: "https://account-pod5.demandware.net",
  // Enables cacache for local caching in temp dir by default, unsafeCleanup == rm -rf on exit
  cacheManager: new DefaultCache(
    tmp.dirSync({ prefix: "cache-", unsafeCleanup: true }).name
  ),
  headers: {}
};

export class BaseClient {
  public clientConfig: ClientConfig;
  public authSchemes: {
    [x: string]: IAuthScheme;
  };

  constructor(config?: ClientConfig) {
    this.clientConfig = {};
    this.authSchemes = {};
    _.merge(this.clientConfig, DEFAULT_CLIENT_CONFIG, config);
  }

  async initializeMockService(): Promise<void> {
    try {
      const token = await getBearer(
        process.env.ANYPOINT_USERNAME,
        process.env.ANYPOINT_PASSWORD
      );

      _.merge(this.clientConfig.headers, {
        "ms2-authorization": `bearer ${token}`,
        "ms2-origin": "Exchange"
      });
    } catch (err) {
      throw new Error("Error while initializing mock client\n".concat(err));
    }
  }
}

export { Response } from "node-fetch";
export { ResponseError } from "./static-client";
