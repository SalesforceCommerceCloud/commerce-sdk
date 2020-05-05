/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { default as fetch, Response, RequestInit } from "make-fetch-happen";

import _ from "lodash";

import DefaultCache = require("make-fetch-happen/cache");
export { DefaultCache, Response };

import { Headers } from "minipass-fetch";

import { Resource } from "./resource";
import { BaseClient } from "./client";
import { sdkLogger } from "./sdkLogger";
import { OperationOptions } from "retry";

/**
 * Extends the Error class with the the error being a combination of status code
 * and text retrieved from the response.
 *
 * @class ResponseError
 * @extends Error
 */
export class ResponseError extends Error {
  constructor(public response: Response) {
    super(`${response.status} ${response.statusText}`);
  }
}

/**
 * Returns the dto object from the given response object on status codes 2xx and
 * 304 (Not Modified). The fetch library make-fetch-happen returns the cached object
 * on 304 response. This method throws error on any other 3xx responses that are not
 * automatically handled by make-fetch-happen.
 *
 * @remarks
 * Refer to https://en.wikipedia.org/wiki/List_of_HTTP_status_codes for more information
 * on HTTP status codes.
 *
 * @param response - A response object either containing a dto or an error
 * @returns The DTO wrapped in a promise
 *
 * @throws a ResponseError if the status code of the response is neither 2XX nor 304
 */
export async function getObjectFromResponse(
  response: Response
): Promise<object> {
  if (response.ok || response.status === 304) {
    const text = await response.text();
    // It's ideal to get "{}" for an empty response body, but we won't throw if it's truly empty
    return text ? JSON.parse(text) : {};
  } else {
    throw new ResponseError(response);
  }
}

/**
 * Format the request being made for logging.
 *
 * @param resource The resource being requested
 * @param fetchOptions The options to the fetch call
 */
export const formatFetchForInfoLog = (
  resource: string,
  fetchOptions: RequestInit
): string => `Request: ${fetchOptions.method.toUpperCase()} ${resource}`;

/**
 * Format the response received for logging.
 *
 * @param response The response received
 */
export const formatResponseForInfoLog = (response: Response): string => {
  const successString =
    response.ok || response.status === 304 ? "successful" : "unsuccessful";
  return `Response: ${successString} ${response.status} ${response.statusText}`;
};

/**
 * Makes an HTTP call specified by the method parameter with the options passed.
 *
 * @param method - Type of HTTP operation
 * @param options - Details to be used for making the HTTP call and processing
 * the response
 * @returns Either the Response object or the DTO inside it wrapped in a promise,
 * depending upon options.rawResponse
 */
async function runFetch(
  method: "delete" | "get" | "patch" | "post" | "put",
  options: {
    client: BaseClient;
    path: string;
    pathParameters?: object;
    queryParameters?: object;
    headers?: { [key: string]: string };
    rawResponse?: boolean;
    retrySettings?: OperationOptions;
    body?: any;
  }
): Promise<object> {
  const resource = new Resource(
    options.client.clientConfig.baseUri,
    options.client.clientConfig.parameters,
    options.path,
    options.pathParameters,
    options.queryParameters
  ).toString();

  // Lets grab all the RequestInit defaults from the clientConfig
  const defaultsFromClientConfig: RequestInit = {
    cacheManager: options.client.clientConfig.cacheManager,
    retry: options.client.clientConfig.retrySettings
  };

  // Let's create a request init object of all configurations in the current request
  const currentOptionsFromRequest: RequestInit = {
    method: method,
    retry: options.retrySettings,
    body: JSON.stringify(options.body)
  };

  // Merging like this will copy items into a new object, this removes the need to clone and then merge as we were before.
  let finalOptions = _.merge(
    {},
    defaultsFromClientConfig,
    currentOptionsFromRequest
  );

  // Headers are treated separately to be able to move them into their own object.
  const headers = new Headers(_.merge({}, options.client.clientConfig.headers));

  for (const [header, value] of Object.entries(options.headers || {})) {
    headers.set(header, value);
  }
  finalOptions["headers"] = headers;

  // This line merges the values and then strips anything that is undefined.
  //  (NOTE: Not sure we have to, as all tests pass regardless, but going to anyways)
  finalOptions = _.pickBy(finalOptions, _.identity);

  sdkLogger.setLevel(sdkLogger.levels.DEBUG);

  sdkLogger.info(formatFetchForInfoLog(resource, finalOptions));
  const response = await fetch(resource, finalOptions);
  sdkLogger.info(formatResponseForInfoLog(response));

  return options.rawResponse ? response : getObjectFromResponse(response);
}

/**
 * Performs an HTTP GET operation with the options passed.
 *
 * @param options - Details to be used for making the HTTP call and processing
 * the response
 * @returns Either the Response object or the DTO inside it wrapped in a promise,
 * depending upon options.rawResponse
 */
export function _get(options: {
  client: BaseClient;
  path: string;
  pathParameters?: object;
  queryParameters?: object;
  headers?: { [key: string]: string };
  rawResponse?: boolean;
}): Promise<object> {
  return runFetch("get", options);
}

/**
 * Performs an HTTP DELETE operation with the options passed.
 *
 * @param options - Details to be used for making the HTTP call and processing
 * the response
 * @returns Either the Response object or the DTO inside it wrapped in a promise,
 * depending upon options.rawResponse
 */
export function _delete(options: {
  client: BaseClient;
  path: string;
  pathParameters?: object;
  queryParameters?: object;
  headers?: { [key: string]: string };
  rawResponse?: boolean;
}): Promise<object> {
  return runFetch("delete", options);
}

/**
 * Performs an HTTP PATCH operation with the options passed.
 *
 * @param options - Details to be used for making the HTTP call and processing
 * the response
 * @returns Either the Response object or the DTO inside it wrapped in a promise,
 * depending upon options.rawResponse
 */
export function _patch(options: {
  client: BaseClient;
  path: string;
  pathParameters?: object;
  queryParameters?: object;
  headers?: { [key: string]: string };
  rawResponse?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
}): Promise<object> {
  return runFetch("patch", options);
}

/**
 * Performs an HTTP POST operation with the options passed.
 *
 * @param options - Details to be used for making the HTTP call and processing
 * the response
 * @returns Either the Response object or the DTO inside it wrapped in a promise,
 * depending upon options.rawResponse
 */
export function _post(options: {
  client: BaseClient;
  path: string;
  pathParameters?: object;
  queryParameters?: object;
  headers?: { [key: string]: string };
  rawResponse?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
}): Promise<object> {
  return runFetch("post", options);
}

/**
 * Performs an HTTP PUT operation with the options passed.
 *
 * @param options - Details to be used for making the HTTP call and processing
 * the response
 * @returns Either the Response object or the DTO inside it wrapped in a promise,
 * depending upon options.rawResponse
 */
export function _put(options: {
  client: BaseClient;
  path: string;
  pathParameters?: object;
  queryParameters?: object;
  headers?: { [key: string]: string };
  rawResponse?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
}): Promise<object> {
  return runFetch("put", options);
}
