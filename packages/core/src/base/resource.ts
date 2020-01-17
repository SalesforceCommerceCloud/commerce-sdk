/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import qs from "qs";

export class Resource {
  constructor(
    private baseUri: string,
    private baseUriParameters?: object,
    private path?: string,
    private pathParameters?: object,
    private queryParameters?: object
  ) {}

  substitutePathParameters(path: string, parameters: object): string {
    return path.replace(/\{([^}]+)\}/g, (_entireMatch, param) => {
      if (parameters && param in parameters) {
        return parameters[param];
      }
      throw new Error(
        `Failed to find a value for required path parameter '${param}'`
      );
    });
  }

  toString(): string {
    const renderedBaseUri = this.baseUriParameters
      ? this.substitutePathParameters(this.baseUri, this.baseUriParameters)
      : this.baseUri;

    const renderedPath = this.path
      ? this.substitutePathParameters(this.path, this.pathParameters)
      : "";

    const queryString = qs.stringify(this.queryParameters);

    return `${renderedBaseUri}${renderedPath}${
      queryString ? "?" : ""
    }${queryString}`;
  }
}
