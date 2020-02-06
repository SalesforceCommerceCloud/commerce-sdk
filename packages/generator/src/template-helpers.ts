/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { model } from "amf-client-js";
import _ from "lodash";
import { WebApiBaseUnitWithEncodesModel } from "webapi-parser";

import { AuthSchemes } from "@commerce-apps/core";

import {
  PRIMITIVE_DATA_TYPE_MAP,
  DEFAULT_DATA_TYPE,
  OBJECT_DATA_TYPE,
  ARRAY_DATA_TYPE
} from "./config";

/**
 * Additional properties are allowed in RAML type definitions using regular expressions
 * We currently support any valid arbitrary property names without any prefixes or suffixes.
 * These properties are rendered using the following semantics
 * const SomeType = { [key: string]: string/boolean/number/SomeOtherType }
 *                      & { definitions for other concrete properties }
 */
const ADDITIONAL_PROPERTY_REGEX_NAMES = ["//", "/.*/"];

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
 * Returns a list of names of the baseUri parameters. This should work the same
 * whether the parameters have been specified in RAML explicitly as
 * baseUriParameters or extracted from baseUri
 * https://github.com/raml-org/raml-spec/blob/master/versions/raml-10/raml-10.md#the-root-of-the-document
 *
 * @param property A model from the AMF parser
 */
export const getBaseUriParameters = function(
  property: WebApiBaseUnitWithEncodesModel
): string[] {
  return property && property.encodes
    ? (property.encodes as model.domain.WebApi).servers[0].variables.map(p =>
        p.name.value()
      )
    : [];
};

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

const getProperties = function(
  propertyShapes: model.domain.PropertyShape[],
  filterEntriesBy: Function
): model.domain.PropertyShape[] {
  return !propertyShapes
    ? []
    : propertyShapes.filter(entry => filterEntriesBy(entry));
};

/**
 * Returns a list of optional properties defined in RAML type.
 * Optional properties have minimum count of 0
 * We ignore optional additional properties which also have minimum count of 0,
 * because of the different semantics used in rendering those properties.
 *
 * @param propertyShapes - Array of properties {model.domain.PropertyShape[]}
 * @returns {model.domain.PropertyShape[]} Array of optional properties
 */
export const onlyOptional = function(
  propertyShapes: model.domain.PropertyShape[]
): model.domain.PropertyShape[] {
  return getProperties(propertyShapes, entry => {
    return (
      entry.minCount.value() == 0 &&
      !ADDITIONAL_PROPERTY_REGEX_NAMES.includes(entry.name.value())
    );
  });
};

/**
 * Returns a list of required properties defined in RAML type.
 * Required properties have minimum count of atleast 1
 * We ignore required additional properties because of the
 * different semantics used in rendering those properties
 *
 * @param propertyShapes - Array of properties {model.domain.PropertyShape[]}
 * @returns {model.domain.PropertyShape[]} Array of required properties
 */
export const onlyRequired = function(
  propertyShapes: model.domain.PropertyShape[]
): model.domain.PropertyShape[] {
  return getProperties(propertyShapes, entry => {
    return (
      entry.minCount.value() > 0 &&
      !ADDITIONAL_PROPERTY_REGEX_NAMES.includes(entry.name.value())
    );
  });
};

/**
 * Returns a list of additional properties defined in RAML type.
 * Additional property names use regular expressions.
 *
 * @param propertyShapes - Array of properties {model.domain.PropertyShape[]}
 * @returns {model.domain.PropertyShape[]} Array of additional properties
 */
export const onlyAdditional = function(
  propertyShapes: model.domain.PropertyShape[]
): model.domain.PropertyShape[] {
  return getProperties(propertyShapes, entry => {
    return ADDITIONAL_PROPERTY_REGEX_NAMES.includes(entry.name.value());
  });
};

export const eachModel = function(context): any[] {
  const ret = _.map(context, (item: any) => {
    if (item.$classData.name === "amf.client.model.domain.NodeShape") {
      return item.declares;
    }
  });
  return ret;
};
