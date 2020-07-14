/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { ASSET_OBJECT_MAP } from "./config";

import { commonParameterPositions } from "@commerce-apps/core";

import _ from "lodash";

/**
 * Checks if a path parameter is one of the set that are configurable at the client level
 *
 * @param property - The string name of the parameter to check
 *
 * @returns true if the parameter is a common parameter
 */
export const isCommonPathParameter = (property: string): boolean =>
  property
    ? commonParameterPositions.pathParameters.includes(property.toString())
    : false;

/**
 * Checks if a query parameter is one of the set that are configurable at the client level
 *
 * @param property - The string name of the parameter to check
 *
 * @returns true if the parameter is a common parameter
 */
export const isCommonQueryParameter = (property: string): boolean =>
  property
    ? commonParameterPositions.queryParameters.includes(property.toString())
    : false;

/**
 * Gets custom object id associated with the specified assetId.
 *
 * @param assetId - The assetId to look up
 *
 * @returns The custom object id as a string
 */
export const getObjectIdByAssetId = (assetId: string): string => {
  return ASSET_OBJECT_MAP[assetId];
};

export type NamedObject = { name: { value: () => string } };

/**
 * Convert a name object to a string.
 *
 * @param obj - The name object to convert to a string
 *
 * @returns the converted name as a string
 */
export const getName = (obj: NamedObject): string => {
  return obj?.name?.value?.() || "";
};

/**
 * Convert a name to lower camel case.
 *
 * @param obj - The name object to convert to lower camel case
 *
 * @returns the converted name as a string
 */
export const getCamelCaseName = (obj: NamedObject): string => {
  return _.camelCase(getName(obj));
};

/**
 * Convert a name to PascalCase.
 *
 * @param obj - The name object to convert the name from
 *
 * @returns the converted name as a string
 */
export const getPascalCaseName = (obj: NamedObject): string => {
  const name = getCamelCaseName(obj);
  return name && name[0].toUpperCase() + name.slice(1);
};

/**
 * Certain characters need to be handled for TSDoc.
 *
 * @param str - The string to be formatted for TSDoc
 *
 * @returns string reformatted for TSDoc
 */
export const formatForTsDoc = (str: string): string => {
  // Brackets are special to TSDoc and less than / greater than are interpreted as HTML
  const symbolsEscaped = str
    .toString()
    .replace(/([^\\])(["{}<>]+)/g, (m) => Array.from(m).join("\\"));
  // Double escaped newlines are replaced with real newlines
  const newlinesUnescaped = symbolsEscaped.replace(/\\n/g, "\n");
  // Double escaped tabs are replaced with a single space
  const tabsUnescaped = newlinesUnescaped.replace(/(\\t)+/g, " ");
  // Collapse leading whitespace of 4 or more to avoid triggering code block formatting
  const collapsedLeadingWhitespace = tabsUnescaped.replace(/\n {4,}/g, "\n   ");

  return collapsedLeadingWhitespace;
};

import { addNamespace } from "./commonTemplateHelper";
export { addNamespace };
