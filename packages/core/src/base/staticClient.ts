/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { default as fetch, Response, RequestInit } from "make-fetch-happen";
import _ from "lodash";
import fetchToCurl from "fetch-to-curl";

import DefaultCache = require("make-fetch-happen/cache");
export { DefaultCache, Response };

import { Resource } from "./resource";
import { BaseClient } from "./client";
import { sdkLogger } from "./sdkLogger";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require("../../package.json");

// Version is from @commerce-apps/core, but it will always match commerce-sdk
export const USER_AGENT = `commerce-sdk@${pkg.version};`;
const CONTENT_TYPE = "application/json";

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
 * Returns the entry from the headers list that matches the passed header. The
 * search is case insensitive and the case of the passed header and the list
 * are preserved. Returns the passed header if no match is found.
 *
 * @param header - Target header
 * @param headers - List to search from
 * @returns Header from the list if there is a match, the passed header otherwise
 */
export function getHeader(
  header: string,
  headers: { [key: string]: string }
): string {
  const headerLowerCase = header.toLowerCase();
  for (const name in headers) {
    if (headerLowerCase === name.toLowerCase()) {
      return name;
    }
  }

  return header;
}

/**
 * Deletes all headers in the list that match the given header, case insensitive.
 *
 * @param header - Target header
 * @param headers - List to search from
 */
export function stripHeaders(
  header: string,
  headers: Record<string, string>
): void {
  const headerLowerCase = header.toLowerCase();
  for (const name in headers) {
    if (headerLowerCase === name.toLowerCase()) {
      delete headers[name];
    }
  }
}

/**
 * Log request/fetch details.
 *
 * @param resource The resource being requested
 * @param fetchOptions The options to the fetch call
 */
export function logFetch(resource: string, fetchOptions: RequestInit): void {
  if (sdkLogger.getLevel() <= sdkLogger.levels.DEBUG) {
    sdkLogger.debug(
      `Request URI: ${resource}\nFetch Options: ${JSON.stringify(
        fetchOptions,
        null,
        2
      )}\nCurl: ${fetchToCurl(resource, fetchOptions)}`
    );
  } else if (sdkLogger.getLevel() <= sdkLogger.levels.INFO) {
    sdkLogger.info(`Request: ${fetchOptions.method.toUpperCase()} ${resource}`);
  }
}

/**
 * Log response details.
 *
 * @param response The response received
 */
export const logResponse = (response: Response): void => {
  const successString =
    response.ok || response.status === 304 ? "successful" : "unsuccessful";
  const msg = `Response: ${successString} ${response.status} ${response.statusText}`;
  if (sdkLogger.getLevel() <= sdkLogger.levels.DEBUG) {
    sdkLogger.debug(
      `${msg}\nResponse Headers: ${JSON.stringify(
        response.headers.raw(),
        null,
        2
      )}`
    );
  } else if (sdkLogger.getLevel() <= sdkLogger.levels.INFO) {
    sdkLogger.info(msg);
  }
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const fetchOptions: RequestInit = {
    method: method
  };

  fetchOptions.headers = options.client.clientConfig.headers
    ? _.clone(options.client.clientConfig.headers)
    : {};

  // make-fetch-happen sets connection header to keep-alive by default which
  // keeps node running unless it is explicitly killed.
  // If the user wants to keep the connection alive they can set the Connection
  // header to 'keep-alive' and we'll respect it. Otherwise, we set it to "close".
  const connectionHeader = getHeader("connection", fetchOptions.headers);
  if (!fetchOptions.headers[connectionHeader]) {
    fetchOptions.headers[connectionHeader] = "close";
  }

  // if headers have been given for just this call, merge those in
  if (options.headers) {
    _.merge(fetchOptions.headers, options.headers);
  }

  // Delete all user-specified user agents to prevent an override
  // (Multiple can be specified by using different casing)
  stripHeaders("user-agent", fetchOptions.headers);
  // Specify user agent using lower case in order to override make-fetch-happen
  fetchOptions.headers["user-agent"] = USER_AGENT;

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
    fetchOptions.headers["Content-Type"] = CONTENT_TYPE;
  }

  // To disable response caching, set cacheManager to null
  if (options.client.clientConfig.cacheManager) {
    fetchOptions.cacheManager = options.client.clientConfig.cacheManager;
  }

  logFetch(resource, fetchOptions);

  const response = await fetch(resource, fetchOptions);

  logResponse(response);

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
