/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import qs from "qs";

/**
 * A class to render a flattened URL from the parts including template
 * parameters. Out of the various options to render an array in a query string,
 * this class repeats the value for each element of the array,
 * i.e. { a: [1, 2]} => "?a=1&a=2".
 * 
 * @export
 * @class Resource
 */
export class Resource {
  constructor(
    private baseUri: string,
    private baseUriParameters = {},
    private path = "",
    private pathParameters = {},
    private queryParameters = {}
  ) {}

  /**
   * Substitutes template parameters in the path with matching parameters.
   * 
   * @param path - String containing template parameters
   * @param parameters - All the parameters that should substitute the template 
   * parameters
   * @returns Path with actual parameters
   */
  substitutePathParameters(path = "", parameters = {}): string {
    return path.replace(/\{([^}]+)\}/g, (_entireMatch, param) => {
      if (param in parameters && parameters[param] !== undefined) {
        return parameters[param];
      }
      throw new Error(
        `Failed to find a value for required path parameter '${param}'`
      );
    });
  }

  /**
   * Create a url from a baseUri, path and query parameters.
   * 
   * @returns Rendered URL
   */
  toString(): string {
    const renderedBaseUri = this.substitutePathParameters(
      this.baseUri,
      this.baseUriParameters
    );

    const renderedPath = this.substitutePathParameters(
      this.path,
      this.pathParameters
    );

    const queryString = qs.stringify(this.queryParameters, {
      arrayFormat: "repeat"
    });

    return `${renderedBaseUri}${renderedPath}${
      queryString ? "?" : ""
    }${queryString}`;
  }
}
