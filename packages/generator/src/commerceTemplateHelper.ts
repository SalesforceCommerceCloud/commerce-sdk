/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { model } from "@commerce-apps/raml-toolkit";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const templateHelpers = require("../src/templateHelpers");

/**
 * Given a type, prefix it with the namespace "types."
 * @param type - in string format to be prefixed
 * @returns the type prefixed by types.
 */
export function addNamespacePrefixToType(type: string): string {
  if (!type) {
    return type;
  }
  const prefix = "types.";
  const types = type.split("|");

  let namespaceTypes = types.filter(checkType =>{
    return checkType.trim() != '';
      
  });
  namespaceTypes = namespaceTypes.map(checkType => {
    if (["void", "Object", "object"].includes(checkType)) {
      return checkType;
    }
    return prefix + checkType.trim();
  });
  const namespaceType = namespaceTypes.join(" | ");
  return namespaceType;
}

/**
 * Given an array in string format, prefix each contained type with the namespace "types." 
 * @param type - in the format Array\<Type1|Type2\>
 * @returns the array with each element prefixed with the namespace, eg Array\<types.Type1 | types.Type2\>
 */
export function addNamespacePrefixToArray(array: string): string {
  if (!array) {
    return array;
  }
  const types = array.replace(/Array|<|>/g, "");

  const namespaceArrayType = addNamespacePrefixToType(types);
  return "Array<".concat(namespaceArrayType).concat(">");
}

/**
 * Gets the request payload type and prefixes it with the "types" namespace.
 *
 * Wrapper for getRequestPayloadTypeWithNamespace
 *
 * @param request - AMF model of the request
 * @returns Type of the request body prefixed with the namespace "types"
 */
export const getRequestPayloadTypeWithNamespace = function(
  request: model.domain.Request
): string {
  if (
    request != null &&
    request.payloads != null &&
    request.payloads.length > 0
  ) {
    const payloadSchema: model.domain.Shape = request.payloads[0].schema;
    if (payloadSchema instanceof model.domain.ArrayShape) {
      return addNamespacePrefixToArray(
        templateHelpers.getRequestPayloadType(request)
      );
    }
  }
  return addNamespacePrefixToType(
    templateHelpers.getRequestPayloadType(request)
  );
};

/**
 * Find the return type info for an operation.
 *
 * Wrapper around TemplateHelpers.getReturnPayloadType
 *
 * @param operation - The operation to get the return type for
 * @returns a string for the data type returned by the successful operation prefixed by namespace
 */
export function getReturnPayloadTypeWithNamespace(
  operation: model.domain.Operation
): string {
  return addNamespacePrefixToType(
    templateHelpers.getReturnPayloadType(operation)
  );
}
