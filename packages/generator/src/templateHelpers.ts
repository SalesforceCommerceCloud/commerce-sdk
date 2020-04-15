/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { model } from "amf-client-js";
import { WebApiBaseUnitWithEncodesModel } from "webapi-parser";

import { commonParameterPositions } from "@commerce-apps/core";

import {
  PRIMITIVE_DATA_TYPE_MAP,
  DEFAULT_DATA_TYPE,
  OBJECT_DATA_TYPE,
  ARRAY_DATA_TYPE,
  ASSET_OBJECT_MAP
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

const getDataTypeFromMap = function(uuidDataType: string): string {
  return PRIMITIVE_DATA_TYPE_MAP[uuidDataType]
    ? PRIMITIVE_DATA_TYPE_MAP[uuidDataType]
    : DEFAULT_DATA_TYPE;
};

/**
 * Get data type from ScalarShape
 * @param scalarShape instance of model.domain.ScalarShape
 * @returns scalar data type if defined otherwise returns a default type
 */
const getScalarType = function(scalarShape: model.domain.ScalarShape): string {
  let dataType: string = undefined;
  if (scalarShape.dataType != null) {
    const typeValue = scalarShape.dataType.value();
    if (typeValue != null) {
      dataType = getDataTypeFromMap(typeValue);
    }
  }
  //check if the type is linked to another scalar type
  if (
    dataType == null &&
    scalarShape.isLink === true &&
    scalarShape.linkTarget != null
  ) {
    dataType = getScalarType(
      scalarShape.linkTarget as model.domain.ScalarShape
    );
  }
  if (dataType == null) {
    dataType = DEFAULT_DATA_TYPE;
  }
  return dataType;
};

/* eslint-disable @typescript-eslint/no-use-before-define */
/**
 * Get type of the array
 * @param arrayShape instance of model.domain.ArrayShape
 * @returns array type if defined otherwise returns a default type
 */
const getArrayType = function(arrayShape: model.domain.ArrayShape): string {
  let arrItem: model.domain.Shape = arrayShape.items;
  if (arrItem == null) {
    if (arrayShape.inherits != null && arrayShape.inherits.length > 0)
      arrItem = (arrayShape.inherits[0] as model.domain.ArrayShape).items;
  }
  // return ARRAY_DATA_TYPE.concat("<")
  //   .concat(getDataType(arrItem))
  //   .concat(">");
  return `[${getDataType(arrItem)}]`;
};

/**
 * Get data type that is linked/inherited
 * @param anyShape instance of model.domain.AnyShape or its subclass
 * @returns linked/inherited data type
 */
const getLinkedType = function(anyShape: model.domain.AnyShape): string {
  let linkedType: model.domain.DomainElement = undefined;
  let dataType: string = undefined;
  //check if type is inherited
  if (anyShape.inherits != null && anyShape.inherits.length > 0) {
    if (
      anyShape.inherits[0] != null &&
      anyShape.inherits[0].isLink === true &&
      anyShape.inherits[0].linkTarget != null
    ) {
      linkedType = anyShape.inherits[0].linkTarget;
    }
  }
  //check if type is linked
  if (
    linkedType == null &&
    anyShape.isLink === true &&
    anyShape.linkTarget != null
  ) {
    linkedType = anyShape.linkTarget;
  }

  if (
    linkedType != null &&
    linkedType instanceof model.domain.AnyShape &&
    linkedType.name != null
  ) {
    const temp = linkedType.name.value();
    if (temp != null) {
      dataType = temp;
    }
  }
  return dataType;
};

/**
 * Get object type
 * @param anyShape instance of model.domain.AnyShape or its subclass
 * @returns object type if defined otherwise returns a default type
 */
const getObjectType = function(anyShape: model.domain.AnyShape): string {
  let dataType: string = getLinkedType(anyShape);
  if (dataType == null) {
    if (
      anyShape instanceof model.domain.NodeShape &&
      anyShape.properties != null
    ) {
      dataType = OBJECT_DATA_TYPE;
    } else {
      dataType = DEFAULT_DATA_TYPE;
    }
  }
  return dataType;
};

/**
 * Get data type of an element from amf model
 * @param dtElement instance of model.domain.DomainElement or its subclass
 * @returns data type if defined otherwise returns a default type
 */
const getDataType = function(dtElement: model.domain.DomainElement): string {
  let dataType: string = undefined;
  if (dtElement != null) {
    if (dtElement instanceof model.domain.ScalarShape) {
      dataType = getScalarType(dtElement);
    } else if (dtElement instanceof model.domain.ArrayShape) {
      dataType = getArrayType(dtElement);
    } else if (dtElement instanceof model.domain.AnyShape) {
      dataType = getObjectType(dtElement);
    }
  }
  if (dataType == null) {
    dataType = DEFAULT_DATA_TYPE;
  }
  return dataType;
};

/**
 * Get data type of a property
 * @param property instance of model.domain.PropertyShape
 * @returns data type if defined in the property otherwise returns a default type
 */
export const getPropertyDataType = function(
  property: model.domain.PropertyShape
): string {
  if (property != null && property.range != null) {
    return getDataType(property.range);
  }
  return DEFAULT_DATA_TYPE;
};

/**
 * Get data type of a parameter
 * @param param instance of model.domain.Parameter
 * @returns data type if defined in the parameter otherwise returns a default type
 */
export const getParameterDataType = function(
  param: model.domain.Parameter
): string {
  if (param != null && param.schema != null) {
    return getDataType(param.schema);
  }
  return DEFAULT_DATA_TYPE;
};

const getPayloadType = function(schema: model.domain.Shape): string {
  const name = schema.name.value();
  if (name == null) {
    return OBJECT_DATA_TYPE;
  }
  if (name === "schema") {
    return OBJECT_DATA_TYPE;
  } else {
    return name;
  }
};

/**
 * Get type of the request body
 * @param request AMF model of tge request
 * @returns Type of the request body
 */
export const getRequestPayloadType = function(
  request: model.domain.Request
): string {
  if (
    request != null &&
    request.payloads != null &&
    request.payloads.length > 0
  ) {
    const payloadSchema: model.domain.Shape = request.payloads[0].schema;
    if (payloadSchema instanceof model.domain.ArrayShape) {
      return ARRAY_DATA_TYPE.concat("<")
        .concat(getPayloadType(payloadSchema.items))
        .concat(">");
    }
    return getPayloadType(payloadSchema);
  }
  return OBJECT_DATA_TYPE;
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

export const getObjectIdByAssetId = function(assetId: string) {
  return ASSET_OBJECT_MAP[assetId];
};
