/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { BodyInit, RequestInit } from "node-fetch";
import {
  ClientConfig,
  Response,
  StaticClient,
  CommonParameters,
} from "@commerce-apps/core";
import { PathParameters } from "@commerce-apps/core/dist/base/resource";
import type { OperationOptions } from "retry";
import { CUSTOM_API_DEFAULT_BASE_URI } from "./config";

// Helper method to find Content Type header
// returns true if it exists, false otherwise
const contentTypeHeaderExists = (
  headers: Record<string, string> | undefined
) => {
  let foundHeader = false;
  if (headers) {
    foundHeader = Boolean(
      Object.keys(headers).find((key) => key.toLowerCase() === "content-type")
    );
  }
  return foundHeader;
};

export type CustomApiParameters = {
  organizationId?: string;
  shortCode?: string;
  endpointName?: string;
  apiName?: string;
  apiVersion?: string;
};

// tsdoc doesn't support dot notation for @param
/* eslint-disable tsdoc/syntax */
/**
 * A helper function designed to make calls to a custom API endpoint
 * For more information about custom APIs, please refer to the [API documentation](https://developer.salesforce.com/docs/commerce/commerce-api/guide/custom-apis.html)
 * @param args - Argument object containing data used for custom API request
 * @param args.options - An object containing any custom settings you want to apply to the request
 * @param args.options.method? - The request HTTP operation. 'GET' is the default if no method is provided.
 * @param args.options.parameters? - Query parameters that are added to the request
 * @param args.options.customApiPathParameters? - Path parameters used for custom API. Required path parameters (apiName, endpointPath, organizationId, and shortCode) can be in this object, or args.clientConfig.parameters, where this object will take priority for duplicates. apiVersion is defaulted to 'v1' if not provided.
 * @param args.options.headers? - Headers that are added to the request. Authorization header should be in this parameter or in the clientConfig.headers. If "Content-Type" is not provided in either header, it will be defaulted to "application/json".
 * @param args.options.body? - Body that is used for the request. The body will be automatically formatted for Content-Type application/json and application/x-www-form-urlencoded
 * @param args.options.retrySettings? - Object for facilitating request retries. For more information, please refer to the [README](https://github.com/SalesforceCommerceCloud/commerce-sdk?tab=readme-ov-file#retry-policies)
 * @param args.options.fetchOptions? - fetchOptions that are passed onto the fetch request, where this will take precedence over clientConfig.fetchOptions
 * @param args.options.enableTransformBody? - Flag when set to true will transform the request body (if available) to match the format expected from the content type header for "application/json" or "application/x-www-form-urlencoded"
 * @param args.clientConfig - Client Configuration object used by the SDK with properties that can affect the fetch call
 * @param args.clientConfig.parameters - Path parameters used for custom API endpoints. The required properties are: apiName, endpointPath, organizationId, and shortCode. An error will be thrown if these are not provided.
 * @param args.clientConfig.headers? - Additional headers that are added to the request. Authorization header should be in this argument or in the options?.headers. options?.headers will override any duplicate properties. If "Content-Type" is not provided in either header, it will be defaulted to "application/json".
 * @param args.clientConfig.baseUri? - baseUri used for the request, where the path parameters are wrapped in curly braces. Default value is 'https://{shortCode}.api.commercecloud.salesforce.com/custom/{apiName}/{apiVersion}'
 * @param args.clientConfig.fetchOptions? - fetchOptions that are passed onto the fetch request
 * @param args.clientConfig.throwOnBadResponse? - flag that when set true will throw a response error if the fetch request fails (returns with a status code outside the range of 200-299 or 304 redirect)
 * @param args.rawResponse? - Flag to return the raw response from the fetch call. True for raw response object, false for the data from the response
 * @returns Raw response or data from response based on rawResponse argument from fetch call
 */
export const callCustomEndpoint = async (args: {
  options: {
    method?: string;
    parameters?: {
      [key: string]: string | number | boolean | string[] | number[];
    };
    customApiPathParameters?: CustomApiParameters;
    headers?: {
      authorization?: string;
    } & { [key: string]: string };
    body?: BodyInit | unknown;
    retrySettings?: OperationOptions;
    fetchOptions?: RequestInit;
    enableTransformBody?: boolean;
  };
  clientConfig: ClientConfig<CustomApiParameters & CommonParameters>;
  rawResponse?: boolean;
}): Promise<Response | unknown> => {
  const { options, clientConfig, rawResponse } = args;

  const requiredArgs = [
    "apiName",
    "endpointPath",
    "organizationId",
    "shortCode",
  ];

  const pathParams: Record<string, unknown> = {
    ...clientConfig.parameters,
    ...options.customApiPathParameters,
  };

  requiredArgs.forEach((arg) => {
    if (!pathParams[arg]) {
      throw new Error(
        `Missing required property needed in options.customApiPathParameters or clientConfig.parameters: ${arg}`
      );
    }
  });

  if (!pathParams.apiVersion) {
    pathParams.apiVersion = "v1";
  }

  const clientConfigCopy = {
    ...clientConfig,
    ...(!clientConfig.baseUri && { baseUri: CUSTOM_API_DEFAULT_BASE_URI }),
    parameters: {
      ...pathParams,
    },
  };

  // Use siteId from clientConfig if it is not defined in options and is available in clientConfig
  const useSiteId = Boolean(
    !options.parameters?.siteId && clientConfig.parameters?.siteId
  );

  const contentTypeExists =
    contentTypeHeaderExists(options.headers) ||
    contentTypeHeaderExists(clientConfigCopy.headers);

  let optionsCopy = options;

  if (!contentTypeExists || useSiteId) {
    optionsCopy = {
      ...options,
      headers: {
        ...options.headers,
        // If Content-Type header does not exist, we default to "Content-Type": "application/json"
        ...(!contentTypeExists && { "Content-Type": "application/json" }),
      },
      parameters: {
        ...options.parameters,
        ...(useSiteId && { siteId: clientConfig.parameters?.siteId as string }),
      },
    };
  }

  const sdkOptions = {
    client: { clientConfig: clientConfigCopy },
    path: "/organizations/{organizationId}/{endpointPath}",
    pathParameters: pathParams as PathParameters,
    queryParameters: optionsCopy.parameters,
    headers: optionsCopy.headers,
    rawResponse,
    retrySettings: (optionsCopy || {})?.retrySettings,
    fetchOptions: optionsCopy.fetchOptions,
    body: optionsCopy?.body,
    disableTransformBody: !optionsCopy?.enableTransformBody,
  };

  const operation = options.method
    ? (options.method?.toLowerCase() as
        | "delete"
        | "get"
        | "patch"
        | "post"
        | "put")
    : "get";
  return StaticClient.runFetch(operation, sdkOptions);
};
