/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import _ from "lodash";
import { config } from "dotenv";
import tmp from "tmp";

import { getBearer } from "@commerce-apps/exchange-connector";

import { CommonParameters } from "./commonParameters";
import { DefaultCache } from "./static-client";
export { DefaultCache };
import { IAuthScheme } from "./auth-schemes";
import { ICacheManager } from "./cache-manager";

// dotenv config loads environmental variables.
config();

export type BaseClientConfig = {
  authHost?: string;
  baseUri?: string;
  baseUriParameters?: { [key: string]: string };
  cacheManager?: ICacheManager;
  clientId?: string;
  clientSecret?: string;
  headers?: { [key: string]: string };
  parameters?: CommonParameters;
};

const DEFAULT_CLIENT_CONFIG: BaseClientConfig = {
  authHost: "https://account-pod5.demandware.net",
  // Enables cacache for local caching in temp dir by default, unsafeCleanup == rm -rf on exit
  cacheManager: new DefaultCache(
    tmp.dirSync({ prefix: "cache-", unsafeCleanup: true }).name
  ),
  headers: {}
};

export class BaseClient {
  public clientConfig: BaseClientConfig;
  public authSchemes: {
    [x: string]: IAuthScheme;
  };

  constructor(config?: BaseClientConfig) {
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
