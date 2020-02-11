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
import { DefaultCache } from "./staticClient";
export { DefaultCache };
import { ICacheManager } from "./cacheManager";

// dotenv config loads environmental variables.
config();

export class ClientConfig {
  public baseUri?: string;
  public cacheManager?: ICacheManager;
  public headers?: { [key: string]: string };
  public parameters?: CommonParameters;
}

const DEFAULT_CLIENT_CONFIG: ClientConfig = {
  // Enables cacache for local caching in temp dir by default, unsafeCleanup == rm -rf on exit
  cacheManager: new DefaultCache(
    tmp.dirSync({ prefix: "cache-", unsafeCleanup: true }).name
  ),
  headers: {},
  parameters: {
    // Ideally, when version is set as a parameter in the baseUri, it's gets
    // filled in from the version field in the RAML. Until that's implemented,
    // we'll default to v1.
    version: "v1"
  }
};

export class BaseClient {
  public clientConfig: ClientConfig;

  constructor(config?: ClientConfig) {
    this.clientConfig = {};
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
export { ResponseError } from "./staticClient";
