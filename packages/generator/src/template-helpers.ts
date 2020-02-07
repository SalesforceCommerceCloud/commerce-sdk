/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { model } from "amf-client-js";
import _ from "lodash";
import { WebApiBaseUnitWithEncodesModel } from "webapi-parser";

import { AuthSchemes, commonParameterPositions } from "@commerce-apps/core";

import {
  PRIMITIVE_DATA_TYPE_MAP,
  DEFAULT_DATA_TYPE,
  OBJECT_DATA_TYPE,
  ARRAY_DATA_TYPE
} from "./config";

/**
 * Selects the baseUri from an AMF model. TypeScript will not allow access to
 * the data without the proper cast to a WebApi type.
 *
 * @param property A model from the the AMF parser
 */
export const getBaseUri = function(
  property: WebApiBaseUnitWithEncodesModel
): string {
  return property && property.encodes
    ? (property.encodes as model.domain.WebApi).servers[0].url.value()
    : "";
};

/**
 * Checks if a path parameter is one of the set that are configurable at the client level
 *
 * @param property The string name of the parameter to check
 *
 * @returns true if the parameter is a common parameter
 */
export const isCommonPathParameter = (property: string) =>
  property
    ? commonParameterPositions.pathParameters.includes(property.toString())
    : false;

/**
 * Checks if a query parameter is one of the set that are configurable at the client level
 *
 * @param property The string name of the parameter to check
 *
 * @returns true if the parameter is a common parameter
 */
export const isCommonQueryParameter = (property: string) =>
  property
    ? commonParameterPositions.queryParameters.includes(property.toString())
    : false;

const isValidProperty = function(property: any): boolean {
  return (
    property !== undefined && property !== null && property.range !== undefined
  );
};

export const isArrayProperty = function(property: any): boolean {
  return (
    isValidProperty(property) &&
    ((property.range.items !== undefined && property.range.items !== null) ||
      (property.range.items === null &&
        Array.isArray(property.range.inherits) &&
        property.range.inherits.length > 0 &&
        property.range.inherits[0].items !== undefined))
  );
};

export const isTypeDefined = function(range: any): boolean {
  if (
    range !== undefined &&
    !range.items &&
    Array.isArray(range.inherits) &&
    range.inherits.length > 0 &&
    range.inherits[0].isLink &&
    range.inherits[0].linkTarget &&
    range.inherits[0].linkTarget.name &&
    range.inherits[0].linkTarget.name.value !== undefined
  ) {
    return true;
  }
  return false;
};

const isObject = function(range: any): boolean {
  return (
    !isTypeDefined(range) &&
    range !== undefined &&
    !range.items &&
    range.properties !== undefined
  );
};

export const isObjectProperty = function(property: any): boolean {
  return isValidProperty(property) && isObject(property.range);
};

const isPrimitive = function(range: any): boolean {
  return (
    range !== undefined &&
    range.dataType !== undefined &&
    range.dataType.value !== undefined
  );
};

export const isPrimitiveProperty = function(property: any): boolean {
  return property !== undefined && isPrimitive(property.range);
};

export const isDefinedProperty = function(property: any): boolean {
  return property !== undefined && isTypeDefined(property.range);
};

export const isTypeDefinition = function(obj: any): boolean {
  return (
    obj !== undefined &&
    (obj.$classData.name === "amf.client.model.domain.NodeShape" ||
      obj.$classData.name === "amf.client.model.domain.ScalarShape")
  );
};

const getPayloadResponses = function(operation: any): model.domain.Response[] {
  const okResponses = [];
  for (const res of operation.responses) {
    if (res.statusCode.nonEmpty && res.statusCode.value().startsWith("2")) {
      okResponses.push(res);
    }
  }
  return okResponses;
};

export const getReturnPayloadType = function(operation: any): string {
  const okResponses = getPayloadResponses(operation);
  // Always at least provide Response as an option
  const dataTypes: string[] = ["Response"];
  okResponses.forEach(res => {
    if (res.payloads.length > 0) {
      dataTypes.push(
        res.payloads[0].schema.name.value() === "schema"
          ? "Object"
          : res.payloads[0].schema.name.value()
      );
    } else {
      dataTypes.push("void");
    }
  });

  if (okResponses.length === 0) {
    dataTypes.push("void");
  }

  return dataTypes.join(" | ");
};

export const getSecurityScheme = function(
  prefix: string,
  security: model.domain.SecurityRequirement[]
): string {
  const secSchemes: model.domain.SecurityRequirement = _.first(security);

  let secScheme: model.domain.ParametrizedSecurityScheme = undefined;

  if (!_.isNil(secSchemes)) {
    secScheme = _.first(secSchemes.schemes);
  }

  // Ensures we found an auth scheme that we support
  // This current only supports a SINGLE auth scheme at a time, need to figure out the best way of supporting multiple
  if (
    !_.isNil(secScheme) &&
    AuthSchemes.hasOwnProperty(secScheme.name.value())
  ) {
    return `${prefix} this.authSchemes.${secScheme.name.value()}`;
  }

  return "";
};

const getDataTypeFromMap = function(uuidDataType: string): string {
  return PRIMITIVE_DATA_TYPE_MAP[uuidDataType]
    ? PRIMITIVE_DATA_TYPE_MAP[uuidDataType]
    : DEFAULT_DATA_TYPE;
};

const getArrayItemObject = function(range: any): any {
  let result = undefined;
  if (range.items !== undefined && range.items !== null) {
    result = range.items;
  } else if (
    range.items === null &&
    Array.isArray(range.inherits) &&
    range.inherits.length > 0 &&
    range.inherits[0].items !== undefined
  ) {
    result = range.inherits[0].items;
  }
  return result;
};

export const getArrayElementTypeProperty = function(property: any): string {
  let result = DEFAULT_DATA_TYPE;
  const itemsObject = getArrayItemObject(property.range);
  if (isPrimitive(itemsObject)) {
    result = getDataTypeFromMap(itemsObject.dataType.value());
  }
  if (isObject(itemsObject)) {
    result = OBJECT_DATA_TYPE;
  }

  if (isTypeDefined(itemsObject)) {
    result = itemsObject.inherits[0].linkTarget.name.value();
  }

  if (
    itemsObject.isLink &&
    itemsObject.linkTarget !== undefined &&
    itemsObject.linkTarget.name !== undefined &&
    itemsObject.linkTarget.name.value !== undefined
  ) {
    result = itemsObject.linkTarget.name.value();
  }

  return result;
};

export const getDataType = function(property: any): string {
  const range = property ? property.range : undefined;
  // check if the property is primitive
  if (isPrimitive(range)) {
    return getDataTypeFromMap(range.dataType.value());
  }
  if (isTypeDefined(range)) {
    return range.inherits[0].linkTarget.name.value();
  }

  if (isObject(range)) {
    return OBJECT_DATA_TYPE;
  }

  if (isArrayProperty(property)) {
    return ARRAY_DATA_TYPE.concat("<")
      .concat(getArrayElementTypeProperty(property))
      .concat(">");
  }
  return DEFAULT_DATA_TYPE;
};

export const getValue = function(name: any): string {
  if (name !== undefined && name.value) {
    return name.value();
  }
  return null;
};

export const onlyRequired = function(classes: any[]): any[] {
  return !classes
    ? []
    : classes.filter(entry => {
        return entry.minCount.value() > 0;
      });
};

export const onlyOptional = function(classes: any[]): any[] {
  return !classes
    ? []
    : classes.filter(entry => {
        return entry.minCount.value() == 0;
      });
};
