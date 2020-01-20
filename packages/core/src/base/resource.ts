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
    private baseUriParameters = {},
    private path = "",
    private pathParameters = {},
    private queryParameters = {}
  ) {}

  substitutePathParameters(path = "", parameters = {}): string {
    return path.replace(/\{([^}]+)\}/g, (_entireMatch, param) => {
      if (param in parameters) {
        return parameters[param];
      }
      throw new Error(
        `Failed to find a value for required path parameter '${param}'`
      );
    });
  }

  toString(): string {
    const renderedBaseUri = this.substitutePathParameters(
      this.baseUri,
      this.baseUriParameters
    );

    const renderedPath = this.substitutePathParameters(
      this.path,
      this.pathParameters
    );

    const queryString = qs.stringify(this.queryParameters);

    return `${renderedBaseUri}${renderedPath}${
      queryString ? "?" : ""
    }${queryString}`;
  }
}
