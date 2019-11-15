import { Response, RequestInit } from "node-fetch";
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
    this.authSchemes = {};
    this.fetchOptions = {};
  }

  initializeMockService(): Promise<void> {
    return getBearer(
      process.env.ANYPOINT_USERNAME,
      process.env.ANYPOINT_PASSWORD
    )
      .then(token => {
        this.fetchOptions = _.merge(this.fetchOptions, {
          headers: {
            "ms2-authorization": `bearer ${token}`,
            "ms2-origin": "Exchange",
            "x-dw-client-id": "mock-client"
          }
        });
      })
      .catch(err => {
        throw new Error("Error while initializing mock client\n".concat(err));
      });
  }
}

export class ResponseError extends Error {
  constructor(public response: Response) {
    super(`${response.status} ${response.statusText}`);
  }
}

export { Response } from "node-fetch";
