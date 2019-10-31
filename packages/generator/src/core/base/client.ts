import { default as fetch, Response } from "node-fetch";
import { ClientConfig } from "./client-config";
import { Resource } from "./resource";

export class BaseClient {
  public baseUri: string;

  constructor(config: ClientConfig) {
    this.baseUri = config.baseUri as string;
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
      { method: "delete" }
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
