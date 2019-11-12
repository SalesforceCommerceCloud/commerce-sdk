import { default as fetch, Response, RequestInit } from "node-fetch";
import { Resource } from "./resource";
import { BaseClient } from "./client";
import { IAuthScheme } from "./auth-schemes";
const CONTENT_TYPE = "application/json";
import _ from "lodash";

function runFetch(
  resource: string,
  fetchOptions: RequestInit,
  authScheme?: IAuthScheme
): Promise<Response> {
  if (authScheme) {
    return authScheme
      .injectAuth(fetchOptions)
      .then(fetchOptions => fetch(resource, fetchOptions));
  } else {
    return fetch(resource, fetchOptions);
  }
}

export function _get(options: {
  client: BaseClient;
  path: string;
  pathParameters?: object;
  queryParameters?: object;
  authScheme?: IAuthScheme;
}): Promise<Response> {
  const fetchOptions: RequestInit = options.client.fetchOptions;

  const resource = new Resource(
    options.client.clientConfig.baseUri,
    options.path,
    options.pathParameters,
    options.queryParameters
  ).toString();
  return runFetch(resource, fetchOptions, options.authScheme);
}

export function _delete(options: {
  client: BaseClient;
  path: string;
  pathParameters?: object;
  queryParameters?: object;
  authScheme?: IAuthScheme;
}): Promise<Response> {
  const fetchOptions: RequestInit = options.client.fetchOptions;
  console.log(fetchOptions);
  fetchOptions.method = "delete";
  const resource = new Resource(
    options.client.clientConfig.baseUri,
    options.path,
    options.pathParameters,
    options.queryParameters
  ).toString();

  return runFetch(resource, fetchOptions, options.authScheme);
}

export function _post(options: {
  client: BaseClient;
  path: string;
  pathParameters?: object;
  queryParameters?: object;
  authScheme?: IAuthScheme;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
}): Promise<Response> {
  const fetchOptions: RequestInit = _.merge(options.client.fetchOptions, {
    method: "post",
    headers: { "Content-Type": CONTENT_TYPE },
    body: JSON.stringify(options.body)
  });
  const resource = new Resource(
    options.client.clientConfig.baseUri,
    options.path,
    options.pathParameters,
    options.queryParameters
  ).toString();

  return runFetch(resource, fetchOptions, options.authScheme);
}
