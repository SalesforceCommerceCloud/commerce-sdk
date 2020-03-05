/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";

import {
  getPropertyDataType,
  getReturnPayloadType,
  getValue,
  isOptionalProperty,
  isRequiredProperty,
  isAdditionalPropertiesAllowed,
  getProperties
} from "../src/templateHelpers";

import _ from "lodash";
import { assert, expect } from "chai";
import { model, AMF } from "amf-client-js";

const getScalarType = function(typeName: string): model.domain.ScalarShape {
  const scalarType: model.domain.ScalarShape = new model.domain.ScalarShape();
  scalarType.withDataType(typeName);

  return scalarType;
};

const getLinkedScalarType = function(typeName: string): model.domain.AnyShape {
  const rangeLink = getScalarType(typeName);

  const range = new model.domain.ScalarShape();
  range.withLinkTarget(rangeLink);

  return range;
};

const getLinkedType = function(typeName: string): model.domain.AnyShape {
  const linkedType = new model.domain.NodeShape();
  linkedType.withName(typeName);

  const shape = new model.domain.AnyShape();
  shape.withLinkTarget(linkedType);

  return shape;
};

const getInheritedType = function(typeName: string): model.domain.AnyShape {
  const nodeShape = new model.domain.AnyShape();
  nodeShape.withInherits([getLinkedType(typeName)]);

  return nodeShape;
};

const getObjectType = function(): model.domain.NodeShape {
  const objProperty: model.domain.PropertyShape = new model.domain.PropertyShape();
  objProperty.withName("test");

  const objType = new model.domain.NodeShape();
  objType.withProperties([objProperty]);

  return objType;
};

describe("Template helper datatype tests", () => {
  before(() => {
    return AMF.init();
  });
  it("Returns 'any' on undefined property", () => {
    expect(getPropertyDataType(undefined)).to.equal("any");
  });

  it("Returns 'any' on null property", () => {
    expect(getPropertyDataType(null)).to.equal("any");
  });

  it("Returns 'boolean' on boolean dataType", () => {
    const property: model.domain.PropertyShape = new model.domain.PropertyShape();
    property.withRange(
      getScalarType("http://www.w3.org/2001/XMLSchema#boolean")
    );

    expect(getPropertyDataType(property)).to.equal("boolean");
  });

  it("Returns 'number' on float dataType", () => {
    const property: model.domain.PropertyShape = new model.domain.PropertyShape();
    property.withRange(getScalarType("http://www.w3.org/2001/XMLSchema#float"));

    expect(getPropertyDataType(property)).to.equal("number");
  });

  it("Returns 'boolean' on boolean linked dataType", () => {
    const property: model.domain.PropertyShape = new model.domain.PropertyShape();
    property.withRange(
      getLinkedScalarType("http://www.w3.org/2001/XMLSchema#boolean")
    );

    expect(getPropertyDataType(property)).to.equal("boolean");
  });

  it("Returns 'any' on undefined dataType", () => {
    const property: model.domain.PropertyShape = new model.domain.PropertyShape();
    property.withRange(getScalarType(undefined));

    expect(getPropertyDataType(property)).to.equal("any");
  });

  it("Returns 'object' on object dataType", () => {
    const property = new model.domain.PropertyShape();
    property.withRange(getObjectType());

    assert.isTrue(getPropertyDataType(property) === "object");
  });

  it("Returns 'defined_type' on inherited object type", () => {
    const property = new model.domain.PropertyShape();
    property.withRange(getInheritedType("defined_type"));

    assert.isTrue(getPropertyDataType(property) === "defined_typeT");
  });

  it("Returns 'defined_type' on linked object type", () => {
    const property = new model.domain.PropertyShape();
    property.withRange(getLinkedType("defined_type"));

    assert.isTrue(getPropertyDataType(property) === "defined_typeT");
  });

  it("Returns 'any' on object type that has no details defined", () => {
    const property = new model.domain.PropertyShape();
    property.withRange(new model.domain.AnyShape());

    expect(getPropertyDataType(property)).to.equal("any");
  });

  it("Returns 'Array<string>' on array of strings", () => {
    const range: model.domain.ArrayShape = new model.domain.ArrayShape();
    range.withItems(getScalarType("http://www.w3.org/2001/XMLSchema#string"));

    const property: model.domain.PropertyShape = new model.domain.PropertyShape();
    property.withRange(range);

    expect(getPropertyDataType(property)).to.equal("Array<string>");
  });

  it("Returns 'Array<defined_type>' on array of linked object types ", () => {
    const range: model.domain.ArrayShape = new model.domain.ArrayShape();
    range.withItems(getLinkedType("defined_type"));

    const property: model.domain.PropertyShape = new model.domain.PropertyShape();
    property.withRange(range);

    expect(getPropertyDataType(property)).to.equal("Array<defined_typeT>");
  });

  it("Returns 'Array<string>' on array of linked string types ", () => {
    const range: model.domain.ArrayShape = new model.domain.ArrayShape();
    range.withItems(
      getLinkedScalarType("http://www.w3.org/2001/XMLSchema#string")
    );

    const property: model.domain.PropertyShape = new model.domain.PropertyShape();
    property.withRange(range);

    expect(getPropertyDataType(property)).to.equal("Array<string>");
  });

  it("Returns 'Array<defined_type>' on array of inherited objected type", () => {
    const inheritedType = new model.domain.ArrayShape();
    inheritedType.withItems(getLinkedType("defined_type"));

    const arrType = new model.domain.ArrayShape();
    arrType.withInherits([inheritedType]);
    const property: model.domain.PropertyShape = new model.domain.PropertyShape();
    property.withRange(arrType);

    expect(getPropertyDataType(property)).to.equal("Array<defined_typeT>");
  });

  it("Returns 'any' on unhandled type", () => {
    const property = new model.domain.PropertyShape();
    property.withRange(new model.domain.PropertyShape());

    expect(getPropertyDataType(property)).to.equal("any");
  });
});

describe("Template helper, response item type tests", () => {
  const operation: model.domain.Operation = new model.domain.Operation();
  before(() => {
    return AMF.init();
  });
  beforeEach(() => {
    const response: model.domain.Response = new model.domain.Response();
    const payload: model.domain.Payload = new model.domain.Payload();
    payload.withSchema(new model.domain.SchemaShape());
    payload.withMediaType("application/json");
    response.withPayloads([payload]);
    operation.withResponses([response]);
  });

  it("Returns 'Object' on unknown datatype", () => {
    const response = operation.responses[0];
    response.payloads[0].schema.withName("schema");
    response.withStatusCode("200");
    expect(getReturnPayloadType(operation)).to.equal("Object");
  });

  it("Returns 'defined_type' on defined_type datatype", () => {
    const response: model.domain.Response = operation.responses[0];
    response.withStatusCode("200");
    response.payloads[0].schema.withName("DefinedType");
    expect(getReturnPayloadType(operation)).to.equal("DefinedTypeT");
  });

  it("Returns 'void' on defined_type datatype, but with statusCode as 500", () => {
    const response: model.domain.Response = operation.responses[0];
    response.withStatusCode("500");
    response.payloads[0].schema.withName("DefinedType");
    expect(getReturnPayloadType(operation)).to.equal("void");
  });

  it("Returns 'void' without responses", () => {
    operation.withResponses([]);
    expect(getReturnPayloadType(operation)).to.equal("void");
  });

  it("Returns 'void' datatype, with response array but with no response codes", () => {
    expect(getReturnPayloadType(operation)).to.equal("void");
  });
});

describe("Template helper tests for get value from name", () => {
  it("Returns null on undefined name", () => {
    assert.isNull(getValue(undefined));
  });

  it("Returns null on undefined value", () => {
    const property: model.domain.ScalarShape = new model.domain.ScalarShape();

    expect(getValue(property.dataType)).to.be.null;
  });

  it("Returns 'valid' on valid value", () => {
    const property: model.domain.ScalarShape = new model.domain.ScalarShape();

    property.withDataType("valid");

    expect(getValue(property.dataType)).to.equal("valid");
  });
});

describe("Template helper tests to check required property", () => {
  it("Returns false on undefined property", () => {
    expect(isRequiredProperty(undefined)).to.be.false;
  });

  it("Return false on null property", () => {
    expect(isRequiredProperty(null)).to.be.false;
  });

  it("Returns false on valid optional properties", () => {
    const property: model.domain.PropertyShape = new model.domain.PropertyShape();
    property.withMinCount(0);
    expect(isRequiredProperty(property)).to.be.false;
  });

  it("Returns true on valid required class", () => {
    const property: model.domain.PropertyShape = new model.domain.PropertyShape();
    property.withMinCount(1);
    expect(isRequiredProperty(property)).to.be.true;
  });
});

describe("Template helper tests to check for optional property", () => {
  it("Returns false on undefined class", () => {
    expect(isOptionalProperty(undefined)).to.be.false;
  });

  it("Returns false on null class", () => {
    expect(isOptionalProperty(undefined)).to.be.false;
  });

  it("Returns false on valid required property", () => {
    const property: model.domain.PropertyShape = new model.domain.PropertyShape();
    property.withMinCount(1);
    expect(isOptionalProperty(property)).to.be.false;
  });

  it("Returns true on valid optional property", () => {
    const property: model.domain.PropertyShape = new model.domain.PropertyShape();
    property.withMinCount(0);
    expect(isOptionalProperty(property)).to.be.true;
  });
});

describe("Template helper tests for isAdditionalPropertiesAllowed", () => {
  before(() => {
    return AMF.init();
  });

  it("Returns false on undefined RAML type", () => {
    expect(isAdditionalPropertiesAllowed(undefined)).to.be.false;
  });

  it("Returns false on Scalar Shape", () => {
    const scalarShape = new model.domain.ScalarShape();
    expect(isAdditionalPropertiesAllowed(scalarShape)).to.be.false;
  });

  it("Returns false on objects other than NodeShape", () => {
    expect(isAdditionalPropertiesAllowed({})).to.be.false;
  });

  it("Returns false when additional properties are not allowed", () => {
    const typeDto = new model.domain.NodeShape();
    // Closed ensures no Additional properties are allowed for this type
    typeDto.withClosed(true);
    expect(isAdditionalPropertiesAllowed(typeDto)).to.be.false;
  });

  it("Returns true when additional properties are allowed", () => {
    const typeDto = new model.domain.NodeShape();
    // Closed ensures no Additional properties are allowed for this type
    typeDto.withClosed(false);
    expect(isAdditionalPropertiesAllowed(typeDto)).to.be.true;
  });
});

function verifyProperties(
  expectedProps: model.domain.PropertyShape[],
  actualProps: model.domain.PropertyShape[]
): void {
  expect(actualProps).to.be.length(expectedProps.length);
  const expectedPropNames: Set<string> = new Set();
  expectedProps.forEach(prop => {
    expectedPropNames.add(prop.name.value());
  });
  actualProps.forEach(prop => {
    expect(expectedPropNames.has(prop.name.value())).to.be.true;
  });
}

describe("Template helper tests for getProperties", () => {
  before(() => {
    return AMF.init();
  });

  it("Returns empty array on undefined model", () => {
    expect(getProperties(undefined)).to.be.empty;
  });

  it("Returns empty array on null model", () => {
    expect(getProperties(null)).to.be.empty;
  });

  it("Returns empty array on model containing only additional property", () => {
    const property: model.domain.PropertyShape = new model.domain.PropertyShape();
    property.withName("//");
    const typeDto = new model.domain.NodeShape();
    typeDto.withProperties([property]);

    expect(getProperties(typeDto)).to.be.empty;
  });

  it("Returns empty array on model containing only one additional property with regex", () => {
    const property: model.domain.PropertyShape = new model.domain.PropertyShape();
    property.withName("/.*/");
    const typeDto = new model.domain.NodeShape();
    typeDto.withProperties([property]);

    expect(getProperties(typeDto)).to.be.empty;
  });

  it("Returns empty array on model containing only one additional property with specific regex", () => {
    const property: model.domain.PropertyShape = new model.domain.PropertyShape();
    property.withName("/^c_.+$/?");
    property.withMinCount(1);
    const typeDto = new model.domain.NodeShape();
    typeDto.withProperties([property]);

    expect(getProperties(typeDto)).to.be.empty;
  });

  it("Returns empty array on model containing only one additional property with prefix regex", () => {
    const property: model.domain.PropertyShape = new model.domain.PropertyShape();
    property.withName("^c_.+$");
    property.withMinCount(1);
    const typeDto = new model.domain.NodeShape();
    typeDto.withProperties([property]);
    expect(getProperties(typeDto)).to.be.empty;
  });

  it("Returns empty array on model that contains no direct properties and no linked properties", () => {
    const typeDto = new model.domain.NodeShape();
    expect(getProperties(typeDto)).to.be.empty;
  });

  it("Returns an array of required and optional parameters on model with required, optional and additional parameters", () => {
    const property1: model.domain.PropertyShape = new model.domain.PropertyShape();
    const property2: model.domain.PropertyShape = new model.domain.PropertyShape();
    const property3: model.domain.PropertyShape = new model.domain.PropertyShape();
    const property4: model.domain.PropertyShape = new model.domain.PropertyShape();
    property1.withName("required");
    property1.withMinCount(1);
    property2.withName("optional");
    property2.withMinCount(0);
    property3.withName("//");
    property4.withName("/.*/");
    const typeDto = new model.domain.NodeShape();
    typeDto.withProperties([property1, property2, property3, property4]);

    verifyProperties([property1, property2], getProperties(typeDto));
  });

  it("Returns an array with inherited parameters", () => {
    const inheritedProp: model.domain.PropertyShape = new model.domain.PropertyShape();
    const property: model.domain.PropertyShape = new model.domain.PropertyShape();
    inheritedProp.withName("p1");
    inheritedProp.withMinCount(1);
    property.withName("p2");
    property.withMinCount(0);
    const inheritedDto = new model.domain.NodeShape();
    inheritedDto.withProperties([inheritedProp]);
    const typeDto = new model.domain.NodeShape();
    typeDto.withProperties([property]);
    typeDto.withInherits([inheritedDto]);

    verifyProperties([inheritedProp, property], getProperties(typeDto));
  });

  it("Returns an array with linked parameters", () => {
    const property1: model.domain.PropertyShape = new model.domain.PropertyShape();
    const property2: model.domain.PropertyShape = new model.domain.PropertyShape();
    property1.withName("p1");
    property1.withMinCount(1);
    property2.withName("p2");
    property2.withMinCount(0);
    const linkedDto = new model.domain.NodeShape();
    linkedDto.withProperties([property1, property2]);
    const typeDto = new model.domain.NodeShape();
    typeDto.withLinkTarget(linkedDto);

    verifyProperties([property1, property2], getProperties(typeDto));
  });

  it("Returns an array excluding duplicate properties", () => {
    const property1: model.domain.PropertyShape = new model.domain.PropertyShape();
    const property2: model.domain.PropertyShape = new model.domain.PropertyShape();
    const property3: model.domain.PropertyShape = new model.domain.PropertyShape();
    const property4: model.domain.PropertyShape = new model.domain.PropertyShape();
    property1.withName("p1");
    property1.withMinCount(1);
    property2.withName("duplicate");
    property2.withMinCount(1);
    property3.withName("p2");
    property3.withMinCount(1);
    property4.withName("duplicate");
    property4.withMinCount(1);
    const inheritedDto = new model.domain.NodeShape();
    inheritedDto.withProperties([property1, property2]);
    const typeDto = new model.domain.NodeShape();
    typeDto.withProperties([property3, property4]);
    typeDto.withInherits([inheritedDto]);

    verifyProperties([property3, property4, property1], getProperties(typeDto));
  });
});
