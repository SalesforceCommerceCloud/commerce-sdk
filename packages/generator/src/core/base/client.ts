import fetch from "node-fetch";

import {Resource} from "./resource";

interface IClient {
  baseUri: string;
  get(path: string, pathParameters:Array<String>): any;
}

export default class BaseClient implements IClient {

  public baseUri: string;

  constructor(baseUri: string) {
    this.baseUri = baseUri;
  }

  get(path:string, pathParameters:Array<string>): any {
    return fetch(new Resource(this.baseUri, path, pathParameters).toString());
  }
}

export {BaseClient};
