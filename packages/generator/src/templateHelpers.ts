/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { model } from "amf-client-js";
import _ from "lodash";
import { WebApiBaseUnitWithEncodesModel } from "webapi-parser";

import { commonParameterPositions } from "@commerce-apps/core";

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
    range != null &&
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

/**
 * Check if the type of the property is linked
 *
 * @param range AMF model that hold the type of the property
 * @returns true if the type of the property is linked
 */
export const isTypeLinked = function(range: model.domain.Shape): boolean {
  return (
    range != null &&
    range.isLink === true &&
    range.linkTarget != null &&
    (range.linkTarget as model.domain.ScalarShape).dataType != null
  );
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
    range != null && range.dataType != null && range.dataType.value() != null
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
    obj != null && obj.$classData.name === "amf.client.model.domain.NodeShape"
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
  const dataTypes: string[] = [];
  okResponses.forEach(res => {
    if (res.payloads.length > 0) {
      dataTypes.push(
        res.payloads[0].schema.name.value() === "schema"
          ? "Object"
          : res.payloads[0].schema.name.value() + "T"
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
    result = itemsObject.inherits[0].linkTarget.name.value() + "T";
  }

  if (
    itemsObject.isLink &&
    itemsObject.linkTarget !== undefined &&
    itemsObject.linkTarget.name !== undefined &&
    itemsObject.linkTarget.name.value !== undefined
  ) {
    result = itemsObject.linkTarget.name.value() + "T";
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
    return range.inherits[0].linkTarget.name.value() + "T";
  }

  if (isTypeLinked(range)) {
    return getDataTypeFromMap(range.linkTarget.dataType.value());
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

type propertyFilter = (propertyName: string) => boolean;

/**
 * Get properties of the DTO (inherited and linked) after applying the given filter criteria
 *
 * @param dtoTypeModel AMF model of the dto
 * @param propertyFilter function to filter properties based on certain criteria
 */
const getFilteredProperties = function(
  dtoTypeModel: model.domain.NodeShape | null | undefined,
  propertyFilter: propertyFilter
): model.domain.PropertyShape[] {
  const properties: model.domain.PropertyShape[] = [];
  const existingProps: Set<string> = new Set();

  while (dtoTypeModel != null) {
    if (dtoTypeModel.properties != null && dtoTypeModel.properties.length > 0) {
      dtoTypeModel.properties.forEach(prop => {
        if (prop != null) {
          const propName = getValue(prop.name);
          //ignore duplicate props
          if (
            propName != null &&
            !existingProps.has(propName) &&
            propertyFilter(propName) === true
          ) {
            existingProps.add(propName);
            properties.push(prop);
          }
        }
      });
      //Check if there are any inherited properties
      if (dtoTypeModel.inherits != null && dtoTypeModel.inherits.length > 0) {
        dtoTypeModel = dtoTypeModel.inherits[0] as model.domain.NodeShape;
      } else {
        dtoTypeModel = null;
      }
    } else if (
      dtoTypeModel.isLink === true &&
      dtoTypeModel.linkTarget != null
    ) {
      //check if other DTO is linked
      dtoTypeModel = dtoTypeModel.linkTarget as model.domain.NodeShape;
    } else {
      dtoTypeModel = null;
    }
  }
  return properties;
};

/**
 * Gets all properties of the DTO
 *
 * @param dtoTypeModel AMF model of the dto
 * @returns Array of properties in the dto that are not regular expressions
 */
export const getProperties = function(
  dtoTypeModel: model.domain.NodeShape | undefined | null
): model.domain.PropertyShape[] {
  return getFilteredProperties(dtoTypeModel, propertyName => {
    return !/^([/^]).*.$/.test(propertyName);
  });
};

/**
 * Check if the property is defined as required.
 * Required properties have minimum count of at least 1
 * We ignore required additional properties because of the
 * different semantics used in rendering those properties
 * @param property
 * @returns true if the property is required
 */
export const isRequiredProperty = function(
  property: model.domain.PropertyShape
): boolean {
  return property != null && property.minCount.value() > 0;
};

/**
 * Check if the property is optional.
 * Optional properties have minimum count of 0
 * We ignore optional additional properties which also have minimum count of 0,
 * because of the different semantics used in rendering those properties.
 * @param property
 * @returns true if the property is optional
 */
export const isOptionalProperty = function(
  property: model.domain.PropertyShape
): boolean {
  return property != null && property.minCount.value() == 0;
};

/**
 * Returns whether additional properties are allowed for a given RAML type.
 *
 * @param ramlTypeDefinition - Any RAML type definition
 * @returns {boolean} true if additional properties are allowed, false otherwise
 */
export const isAdditionalPropertiesAllowed = function(
  ramlTypeDefinition: any
): boolean {
  return (
    ramlTypeDefinition !== undefined &&
    ramlTypeDefinition.closed !== undefined &&
    ramlTypeDefinition.closed.value !== undefined &&
    !ramlTypeDefinition.closed.value()
  );
};
