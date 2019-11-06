import {
  PRIMITIVE_DATA_TYPE_MAP,
  DEFAULT_DATA_TYPE,
  OBJECT_DATA_TYPE,
  ARRAY_DATA_TYPE,
  RESPONSE_DATA_TYPE
} from "./config";

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

const getPayloadResponses = function(operation: any): any {
  const okResponse = [];
  for (const res of operation.responses) {
    if (
      res.statusCode.value() == "200" &&
      Array.isArray(res.payloads) &&
      res.payloads.length > 0 &&
      res.payloads[0].mediaType !== undefined &&
      res.payloads[0].mediaType.value !== undefined &&
      res.payloads[0].mediaType.value() === "application/json" &&
      res.payloads[0].schema !== undefined &&
      isTypeDefined(res.payloads[0].schema)
    ) {
      okResponse.push(res);
    }
  }
  return okResponse;
};

export const isReturnPayloadDefined = function(operation: any): boolean {
  if (operation && !Array.isArray(operation.responses)) {
    return false;
  }
  const okResponse = getPayloadResponses(operation);
  if (okResponse.length !== 1) {
    return false;
  }
  return true;
};

export const getReturnPayloadType = function(operation: any): string {
  if (isReturnPayloadDefined(operation)) {
    const okResponses = getPayloadResponses(operation);
    return okResponses[0].payloads[0].schema.inherits[0].linkTarget.name.value();
  }
  return RESPONSE_DATA_TYPE;
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
