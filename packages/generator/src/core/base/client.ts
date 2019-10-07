import { default as fetch, Response } from "node-fetch";

import { Resource } from "./resource";

interface IClient {
  baseUri: string;
  get(path: string, pathParameters: object, queryParameters: object): Promise<Response>;
}

export default class BaseClient implements IClient {

  public baseUri: string;

  constructor(baseUri: string) {
    this.baseUri = baseUri;
  }

  get(path: string, pathParameters?: object, queryParameters?: object): Promise<Response> {
    return fetch(new Resource(this.baseUri, path, pathParameters, queryParameters).toString());
  }
}

export { BaseClient };
