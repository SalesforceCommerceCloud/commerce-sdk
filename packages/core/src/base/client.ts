import { default as fetch, HeadersInit, Response } from "node-fetch";
import { ClientConfig } from "./client-config";
import { Resource } from "./resource";
import { config } from "dotenv";
import { getBearer } from "@commerce-sdk/exchange-connector";

import {
  MOCK_SERVICE_BEARER_HEADER_KEY,
  MOCK_SERVICE_CLIENT_ID_HEADER_KEY,
  DEFAULT_CLIENT
} from "./constants";

/**
 * dotenv config loads environmental variables.
 */
config();

const CONTENT_TYPE = "application/json";

export class BaseClient {
  public baseUri: string;
  public useMock: boolean;
  private mockServiceToken: string;
  private headers: HeadersInit;

  constructor(config: ClientConfig) {
    this.baseUri = config.baseUri as string;
    this.useMock = config.useMock as boolean;
    this.initializeMockServiceAuth();
  }

  initializeMockServiceAuth(): void {
    if (this.useMock) {
      Promise.resolve(
        getBearer(process.env.ANYPOINT_USERNAME, process.env.ANYPOINT_PASSWORD)
          .then(token => {
            this.mockServiceToken = token;
            this.headers = {
              MOCK_SERVICE_BEARER_HEADER_KEY: "bearer ".concat(
                this.mockServiceToken
              ),
              "ms2-origin": "Exchange",
              MOCK_SERVICE_CLIENT_ID_HEADER_KEY: DEFAULT_CLIENT
            };
          })
          .catch(err => {
            throw new Error(
              "Error while initializing mock client\n".concat(err)
            );
          })
      );
    }
  }

  get(
    path: string,
    pathParameters?: object,
    queryParameters?: object
  ): Promise<Response> {
    return fetch(
      new Resource(
        this.baseUri,
        path,
        pathParameters,
        queryParameters
      ).toString(),
      { headers: this.headers }
    );
  }

  delete(
    path: string,
    pathParameters?: object,
    queryParameters?: object
  ): Promise<Response> {
    return fetch(
      new Resource(
        this.baseUri,
        path,
        pathParameters,
        queryParameters
      ).toString(),
      { method: "delete", headers: this.headers }
    );
  }

  post(
    path: string,
    pathParameters: object,
    queryParameters: object,
    body: any
  ): Promise<Response> {
    return fetch(
      new Resource(
        this.baseUri,
        path,
        pathParameters,
        queryParameters
      ).toString(),
      {
        method: "post",
        headers: { "Content-Type": CONTENT_TYPE },
        body: JSON.stringify(body)
      }
    );
  }
}

export class ResponseError extends Error {
  constructor(public response: Response) {
    super(`${response.status} ${response.statusText}`);
  }
}

export { ClientConfig } from "./client-config";
export { Response } from "node-fetch";
