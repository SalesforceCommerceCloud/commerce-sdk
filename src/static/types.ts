/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Makes a type easier to read.
 */
type Prettify<T> = NonNullable<{
  [K in keyof T]: T[K];
}>;

/**
 * Generates the types required on a method, based on those provided in the config.
 */
export type CompositeParameters<
  MethodParameters extends Record<string, unknown>,
  ConfigParameters extends Record<string, unknown>
> = Prettify<
  Omit<MethodParameters, keyof ConfigParameters> & Partial<MethodParameters>
>;

/**
 * If an object has a `parameters` property, and the `parameters` object has required properties,
 * then the `parameters` property on the root object is marked as required.
 */
export type RequireParametersUnlessAllAreOptional<
  T extends { parameters?: Record<string, unknown> }
> = Record<string, never> extends NonNullable<T["parameters"]>
  ? T
  : Prettify<T & Required<Pick<T, "parameters">>>;

/**
 * Template parameters used in the base URI of all API endpoints. `version` will default to `"v1"`
 * if not specified.
 */
export interface BaseUriParameters {
  shortCode: string;
  version?: string; // Optional, will default to "v1" if not provided.
}

/**
 * Generic interface for path parameters.
 */
export interface PathParameters {
  [key: string]: string | number | boolean;
}

/**
 * Generic interface for query parameters.
 */
export interface QueryParameters {
  [key: string]: string | number | boolean | string[] | number[];
}

/**
 * Generic interface for all parameter types.
 */
export type UrlParameters = PathParameters | QueryParameters;
