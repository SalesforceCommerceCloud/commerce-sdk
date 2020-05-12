/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import _ from "lodash";
import { config } from "dotenv";
import tmp from "tmp";
import { OperationOptions } from "retry";

import { getBearer } from "@commerce-apps/raml-toolkit";

import { CommonParameters } from "./commonParameters";
import { DefaultCache } from "./staticClient";
export { DefaultCache };
import { ICacheManager } from "./cacheManager";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require("../../package.json");

// Version is from @commerce-apps/core, but it will always match commerce-sdk
export const USER_AGENT = `commerce-sdk@${pkg.version}`;

// dotenv config loads environmental variables.
config();

/**
 * Defines all the parameters that can be reused by the client.
 *
 * @remarks
 * Headers can be overwritten when actual calls are made.
 *
 * @class ClientConfig
 */
export class ClientConfig {
  public baseUri?: string;
  public cacheManager?: ICacheManager;
  public headers?: { [key: string]: string };
  public appendHeaders?: { [key: string]: string };
  public parameters?: CommonParameters;
  public retrySettings?: OperationOptions;
}

const DEFAULT_CLIENT_CONFIG: ClientConfig = {
  // Enables cacache for local caching in temp dir by default, unsafeCleanup == rm -rf on exit
  cacheManager: new DefaultCache(
    tmp.dirSync({ prefix: "cache-", unsafeCleanup: true }).name
  ),
  headers: {
    "content-type": "application/json",
    connection: "close"
  },
  // These are headers that are always Added to all calls
  // The can still technically be disabled by overwriting this in the config.
  // This is something I am okay with as it is an explicit action. And think we should avoid magic that prevent explicit actions.
  appendHeaders: {
    "user-agent": USER_AGENT
  },
  parameters: {
    // Ideally, when version is set as a parameter in the baseUri, it's gets
    // filled in from the version field in the RAML. Until that's implemented,
    // we'll default to v1.
    version: "v1"
  }
};

/**
 * A basic implementation of a client that all the Commerce API clients extend.
 *
 * @class BaseClient
 */
export class BaseClient {
  public clientConfig: ClientConfig;

  constructor(config?: ClientConfig) {
    this.clientConfig = {};
    _.merge(this.clientConfig, DEFAULT_CLIENT_CONFIG, config);
  }

  /**
   * Initializes a mock service for the client to interact with.
   *
   * @remarks
   * It is used for testing purposes.
   *
   * @returns A promise of type void
   */
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

export { Response } from "minipass-fetch";
export { ResponseError } from "./staticClient";
