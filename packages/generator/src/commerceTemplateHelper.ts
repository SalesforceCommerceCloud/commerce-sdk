/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { model } from "@commerce-apps/raml-toolkit";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const templateHelpers = require("../src/templateHelpers");

function addNamespacePrefixToType(type: string): string {
  const prefix = "types.";
  const types = type.split(" | ");

  const namespaceTypes = types.map(checkType => {
    if (["void", "Object", "object"].includes(checkType)) {
      return checkType;
    }
    return prefix + checkType;
  });
  const namespaceType = namespaceTypes.join(" | ");
  return namespaceType;
}

function addNamespacePrefixToArray(type: string): string {
  const types = type.replace(/Array|<|>/g, "");

  const namespaceArrayType = addNamespacePrefixToType(types);
  const ret = "Array<".concat(namespaceArrayType).concat(">");
  return ret;
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
