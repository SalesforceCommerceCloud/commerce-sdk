/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { RequestInit } from "node-fetch";
import { IAuthScheme } from "./auth-schemes";
import _ from "lodash";

import { config } from "dotenv";
import { getBearer } from "@commerce-sdk/exchange-connector";

/**
 * dotenv config loads environmental variables.
 */
config();

export type ClientConfig = {
  authHost?: string;
  baseUri?: string;
  clientId?: string;
  clientSecret?: string;
};

const DEFAULT_CLIENT_CONFIG: ClientConfig = {
  authHost: "https://account-pod5.demandware.net"
};

export class BaseClient {
  public clientConfig: ClientConfig;
  public authSchemes: {
    [x: string]: IAuthScheme;
  };

  public fetchOptions: RequestInit;

  constructor(config?: ClientConfig) {
    this.clientConfig = _.merge(DEFAULT_CLIENT_CONFIG, config);
    this.fetchOptions = {};
  }

  async initializeMockService(): Promise<void> {
    try {
      const token = await getBearer(
        process.env.ANYPOINT_USERNAME,
        process.env.ANYPOINT_PASSWORD
      );

      this.fetchOptions = _.merge(this.fetchOptions, {
        headers: {
          "ms2-authorization": `bearer ${token}`,
          "ms2-origin": "Exchange"
        }
      });
    } catch (err) {
      throw new Error("Error while initializing mock client\n".concat(err));
    }
  }
}

export { Response } from "node-fetch";
export { ResponseError } from "./static-client";
