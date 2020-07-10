/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

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
  typesToProcess.forEach(checkType => {
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
