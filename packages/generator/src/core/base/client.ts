import { default as fetch, Response } from "node-fetch";
import { ClientConfig } from "./client-config";
import { Resource } from "./resource";

export class BaseClient {
  public baseUri: string;

  constructor(config: ClientConfig) {
    this.baseUri = config.baseUri;
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
      ).toString()
    );
  }
}

export { ClientConfig } from "./client-config";
export { Response } from "node-fetch";
