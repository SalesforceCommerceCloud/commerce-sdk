/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { ASSET_OBJECT_MAP } from "./config";

import { commonParameterPositions } from "@commerce-apps/core";
import { amf } from "@commerce-apps/raml-toolkit";

/**
 * Given an individual type or an array of types in the format Array\<Foo | Baa\>
 * will return either the type prefixed by the namespace, or the Array with each type prefixed
 * eg. Array\<types.Foo | types.Baa\>
 *
 * @param content - to be parsed for types to prefix with a namespace
 * @param namespace - to be prefixed to types
 * @returns the content prefixed with the namespace
 */
export function addNamespace(content: string, namespace: string): string {
  // Not handling invalid content.
  if (!content) {
    throw new Error("Invalid content");
  }
  // Not handling invalid namespace.
  if (!namespace) {
    throw new Error("Invalid namespace");
  }

  // if the content is an array, extract all of the elements
  const matched = content.match(/^Array<(.*?)>$/);
  const arrayType = !!matched;
  const types = matched?.[1] || content;

  // Get a handle on individual types
  const typesToProcess = types.split("|");
  const namespaceTypes: string[] = [];

  // for each type
  typesToProcess.forEach((checkType) => {
    // trim the fat
    const actualType = checkType.trim();
    // check if there's an actual type present
    if (actualType === "") {
      throw new Error("Empty type found");
    }

    // void and object types don't get a namespace
    if (["void", "object"].includes(actualType.toLocaleLowerCase())) {
      namespaceTypes.push(actualType);
    } else {
      // everything else does
      namespaceTypes.push(`${namespace}.${actualType}`);
    }
  });

  // reconstruct the passed in type with the namespace
  const processedTypes = namespaceTypes.join(" | ");

  // Re-add Array if required
  if (arrayType) {
    return `Array<${processedTypes}>`;
  }
  return processedTypes;
}

/**
 * Gets custom CCDC object id associated with the specified assetId.
 *
 * @param assetId - The assetId to look up
 * @param enforceCcdcId - Whether to throw if a CCDC ID is missing
 *
 * @returns The custom object id as a string
 */
export const getObjectIdByAssetId = (
  assetId: string,
  enforceCcdcId = true
): string => {
  if (ASSET_OBJECT_MAP.hasOwnProperty(assetId)) {
    return ASSET_OBJECT_MAP[assetId];
  } else if (enforceCcdcId) {
    throw new Error(
      `Missing CCDC object ID for "${assetId}"
        When this error occurs, find the corresponding API in the CCDC and copy the
        object ID from the URL. Add the asset ID and object ID to ASSET_OBJECT_MAP in ./config.ts.
        CCDC API Reference: https://developer.commercecloud.com/s/api-reference
    `
    );
  } else {
    return "";
  }
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
 * Checks whether a trait is allowed to be used in the API. Only traits that comply
 * with API standards are allowed.
 *
 * Currently, the only known non-compliant trait is "offset-paginated". It does
 * not comply because it is not a camel case name. It can be safely ignored because
 * the compliant "OffsetPaginated" is also available. (The kebab case version has
 * not been removed to maintain backward compatibility.)
 *
 * @param trait - Trait to check
 * @returns true unless the trait's name is "offset-paginated"
 */
export const isAllowedTrait = (trait: amf.model.domain.Trait): boolean => {
  return /^[A-Za-z][A-Za-z0-9]*$/.test(trait.name.value());
};
