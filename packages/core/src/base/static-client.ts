/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { default as fetch, Response, RequestInit } from "node-fetch";
import { Resource } from "./resource";
import { BaseClient } from "./client";
import { IAuthScheme } from "./auth-schemes";
const CONTENT_TYPE = "application/json";
import _ from "lodash";

export class ResponseError extends Error {
  constructor(public response: Response) {
    super(`${response.status} ${response.statusText}`);
  }
}

async function getObjectFromResponse(response: Response): Promise<object> {
  if (response.ok) {
    const text = await response.text();
    // It's ideal to get "{}" for an empty response body, but we won't throw if it's truly empty
    return text ? JSON.parse(text) : {};
  } else {
    throw new ResponseError(response);
  }
}

async function runFetch(
  method: "delete" | "get" | "patch" | "post" | "put",
  options: {
    client: BaseClient;
    path: string;
    pathParameters?: object;
    queryParameters?: object;
    authScheme?: IAuthScheme;
    body?: any;
  }
): Promise<object> {
  const resource = new Resource(
    options.client.clientConfig.baseUri,
    options.path,
    options.pathParameters,
    options.queryParameters
  ).toString();

  const fetchOptions: RequestInit = {
    method: method
  };

  if (options.authScheme) {
    fetchOptions.headers = await options.authScheme.injectAuth(
      options.client.clientConfig.headers
    );
  } else {
    fetchOptions.headers = options.client.clientConfig.headers
      ? options.client.clientConfig.headers
      : {};
  }

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
    fetchOptions.headers["Content-Type"] = CONTENT_TYPE;
  }

  const response = await fetch(resource, fetchOptions);

  return getObjectFromResponse(response);
}

export function _get(options: {
  client: BaseClient;
  path: string;
  pathParameters?: object;
  queryParameters?: object;
  authScheme?: IAuthScheme;
}): Promise<object> {
  return runFetch("get", options);
}

export function _delete(options: {
  client: BaseClient;
  path: string;
  pathParameters?: object;
  queryParameters?: object;
  authScheme?: IAuthScheme;
}): Promise<object> {
  return runFetch("delete", options);
}

export function _patch(options: {
  client: BaseClient;
  path: string;
  pathParameters?: object;
  queryParameters?: object;
  authScheme?: IAuthScheme;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
}): Promise<object> {
  return runFetch("patch", options);
}

export function _post(options: {
  client: BaseClient;
  path: string;
  pathParameters?: object;
  queryParameters?: object;
  authScheme?: IAuthScheme;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
}): Promise<object> {
  return runFetch("post", options);
}

export function _put(options: {
  client: BaseClient;
  path: string;
  pathParameters?: object;
  queryParameters?: object;
  authScheme?: IAuthScheme;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
}): Promise<object> {
  return runFetch("put", options);
}
