import { default as fetch, Response } from "node-fetch";
import { ClientConfig } from "./client-config";
import { Resource } from "./resource";

const CONTENT_TYPE = "application/json";

export class ResponseError extends Error {
  constructor(public response: Response) {
    super(`${response.status} ${response.statusText}`);
  }
}

export class BaseClient {
  public baseUri: string;

  constructor(config: ClientConfig) {
    this.baseUri = config.baseUri as string;
  }

  get(
    path: string,
    pathParameters?: object,
    queryParameters?: object
  ): Promise<any> {
    return fetch(
      new Resource(
        this.baseUri,
        path,
        pathParameters,
        queryParameters
      ).toString()
    ).then(this.getJsonFromResponse);
  }

  delete(
    path: string,
    pathParameters?: object,
    queryParameters?: object
  ): Promise<any> {
    return fetch(
      new Resource(
        this.baseUri,
        path,
        pathParameters,
        queryParameters
      ).toString(),
      { method: "delete" }
    ).then(this.getJsonFromResponse);
  }

  post(
    path: string,
    pathParameters: object,
    queryParameters: object,
    body: any
  ): Promise<any> {
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
    ).then(this.getJsonFromResponse);
  }

  getJsonFromResponse(response: Response): Promise<any> {
    if (response.ok) {
      // It's ideal to get "{}" for an empty response body, but we won't throw if it's truly empty
      return response.text().then(text => (text ? JSON.parse(text) : {}));
    } else {
      throw new ResponseError(response);
    }
  }
}

export { ClientConfig } from "./client-config";
export { Response } from "node-fetch";
