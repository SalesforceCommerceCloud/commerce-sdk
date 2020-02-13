/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";

import {
  getArrayElementTypeProperty,
  getDataType,
  getReturnPayloadType,
  getValue,
  isArrayProperty,
  isDefinedProperty,
  isObjectProperty,
  isPrimitiveProperty,
  isTypeDefined,
  isOptionalProperty,
  isRequiredProperty,
  getAdditionalProperties,
  isAdditionalPropertiesAllowed,
  getProperties,
  isTypeLinked
} from "../src/templateHelpers";

import _ from "lodash";
import { assert, expect } from "chai";
import { model, AMF } from "amf-client-js";

describe("Template helper primitive datatype tests", () => {
  before(() => {
    return AMF.init();
  });
  it("Returns 'any' on undefined property", () => {
    assert.isTrue(getDataType(undefined) === "any");
  });

  it("Returns 'boolean' on boolean dataType", () => {
    const property: model.domain.PropertyShape = new model.domain.PropertyShape();
    const range: model.domain.ScalarShape = new model.domain.ScalarShape();

    range.withDataType("http://www.w3.org/2001/XMLSchema#boolean");
    property.withRange(range);

    expect(getDataType(property)).to.equal("boolean");
  });

  it("Returns 'number' on float dataType", () => {
    const property: model.domain.PropertyShape = new model.domain.PropertyShape();
    const range: model.domain.ScalarShape = new model.domain.ScalarShape();

    range.withDataType("http://www.w3.org/2001/XMLSchema#float");
    property.withRange(range);

    expect(getDataType(property)).to.equal("number");
  });

  it("Returns 'any' on undefined dataType", () => {
    const property: model.domain.PropertyShape = new model.domain.PropertyShape();
    const range: model.domain.ScalarShape = new model.domain.ScalarShape();

    range.withDataType(undefined);
    property.withRange(range);

    expect(getDataType(property)).to.equal("any");
  });

  it("Returns 'object' on object dataType", () => {
    const property = {
      range: {
        properties: { a: "b" }
      }
    };

    assert.isTrue(getDataType(property) === "object");
  });

  it("Returns 'defined_type' on defined_type dataType", () => {
    const property = {
      range: {
        inherits: [
          {
            isLink: true,
            linkTarget: {
              name: {
                value: () => "defined_type"
              }
            }
          }
        ]
      }
    };

    assert.isTrue(getDataType(property) === "defined_type");
  });

  it("Returns 'boolean' on boolean linked dataType", () => {
    const property: model.domain.PropertyShape = new model.domain.PropertyShape();
    const range: model.domain.ScalarShape = new model.domain.ScalarShape();
    const rangeLink: model.domain.ScalarShape = new model.domain.ScalarShape();
    rangeLink.withDataType("http://www.w3.org/2001/XMLSchema#boolean");
    range.withLinkTarget(rangeLink);
    property.withRange(range);

    expect(getDataType(property)).to.equal("boolean");
  });
});

describe("Template helper Array item type tests", () => {
  before(() => {
    return AMF.init();
  });
  it("Returns 'Array<any>' on array of unknown dataType", () => {
    const property: model.domain.PropertyShape = new model.domain.PropertyShape();
    const range: model.domain.ArrayShape = new model.domain.ArrayShape();
    const item: model.domain.ScalarShape = new model.domain.ScalarShape();

    item.withDataType("unknown");
    range.withItems(item);
    property.withRange(range);

    expect(getDataType(property)).to.equal("Array<any>");
  });

  it("Returns 'Array<string>' on array of string dataType", () => {
    const property: model.domain.PropertyShape = new model.domain.PropertyShape();
    const range: model.domain.ArrayShape = new model.domain.ArrayShape();
    const item: model.domain.ScalarShape = new model.domain.ScalarShape();

    item.withDataType("http://www.w3.org/2001/XMLSchema#string");
    range.withItems(item);
    property.withRange(range);

    expect(getDataType(property)).to.equal("Array<string>");
  });

  it("Returns 'Array<number>' on array of double dataType", () => {
    const property: model.domain.PropertyShape = new model.domain.PropertyShape();
    const range: model.domain.ArrayShape = new model.domain.ArrayShape();
    const item: model.domain.ScalarShape = new model.domain.ScalarShape();

    item.withDataType("http://www.w3.org/2001/XMLSchema#double");
    range.withItems(item);
    property.withRange(range);

    expect(getDataType(property)).to.equal("Array<number>");
  });

  it("Returns 'Array<object>' on array of object dataType", () => {
    const property = {
      range: {
        items: {
          properties: { a: "b" }
        }
      }
    };
    assert.isTrue(getDataType(property) === "Array<object>");
  });

  it("Returns 'Array<defined_type>' on array of defined_type dataType", () => {
    const property = {
      range: {
        items: {
          inherits: [
            {
              isLink: true,
              linkTarget: {
                name: {
                  value: () => "defined_type"
                }
              }
            }
          ]
        }
      }
    };
    assert.isTrue(getDataType(property) === "Array<defined_type>");
  });

  it("Returns 'Array<any>' on array of object dataType with isLink as false", () => {
    const property = {
      range: {
        items: {
          inherits: [
            {
              isLink: false,
              linkTarget: {
                name: {
                  value: () => "defined_type"
                }
              }
            }
          ]
        }
      }
    };
    assert.isTrue(getDataType(property) === "Array<any>");
  });

  it("Returns 'Array<any>' on array of object dataType with no value function", () => {
    const property = {
      range: {
        items: {
          inherits: [
            {
              isLink: true,
              linkTarget: {
                name: {
                  noValueFunction: () => "defined_type"
                }
              }
            }
          ]
        }
      }
    };
    assert.isTrue(getDataType(property) === "Array<any>");
  });

  it("Returns 'defined_type' on array of defined_type items", () => {
    const property = {
      range: {
        items: {
          inherits: [
            {
              isLink: true,
              linkTarget: {
                name: {
                  value: () => "defined_type"
                }
              }
            }
          ]
        }
      }
    };
    assert.isTrue(getArrayElementTypeProperty(property) === "defined_type");
  });

  it("Returns 'any' on array of defined_type items, but isLink is false", () => {
    const property = {
      range: {
        items: {
          inherits: [
            {
              isLink: false,
              linkTarget: {
                name: {
                  value: () => "defined_type"
                }
              }
            }
          ]
        }
      }
    };
    assert.isTrue(getArrayElementTypeProperty(property) === "any");
  });

  it("Returns 'object' on array of defined_type items, but isLink is undefined", () => {
    const property = {
      range: {
        items: {
          properties: {
            a: "string"
          }
        }
      }
    };
    assert.isTrue(getArrayElementTypeProperty(property) === "object");
  });

  it("Returns 'string' on array of defined_type items, but isLink is undefined", () => {
    const property: model.domain.PropertyShape = new model.domain.PropertyShape();
    const range: model.domain.ArrayShape = new model.domain.ArrayShape();
    const item: model.domain.ScalarShape = new model.domain.ScalarShape();

    item.withDataType("http://www.w3.org/2001/XMLSchema#string");
    range.withItems(item);
    property.withRange(range);

    expect(getArrayElementTypeProperty(property)).to.equal("string");
  });
});

describe("Template helper tests array literal definitions like string[], defined_type[], etc", () => {
  it("Returns 'string' on range.items is null", () => {
    const property = {
      range: {
        items: null,
        inherits: [
          {
            items: {
              dataType: {
                value: () => "http://www.w3.org/2001/XMLSchema#string"
              }
            }
          }
        ]
      }
    };
    assert.equal(getArrayElementTypeProperty(property), "string");
  });

  it("Returns 'defined_type' on range.items is null and defined_type as data type for array items", () => {
    const property = {
      range: {
        items: null,
        inherits: [
          {
            items: {
              isLink: true,
              linkTarget: {
                name: {
                  value: () => "defined_type"
                },
                dataType: {
                  value: () => "http://www.w3.org/2001/XMLSchema#string"
                }
              }
            }
          }
        ]
      }
    };
    assert.equal(getArrayElementTypeProperty(property), "defined_type");
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

  it("Returns 'Response | Object' on unknown datatype", () => {
    const response = operation.responses[0];
    response.payloads[0].schema.withName("schema");
    response.withStatusCode("200");
    expect(getReturnPayloadType(operation)).to.equal("Response | Object");
  });

  it("Returns 'defined_type' on defined_type datatype", () => {
    const response: model.domain.Response = operation.responses[0];
    response.withStatusCode("200");
    response.payloads[0].schema.withName("DefinedType");
    expect(getReturnPayloadType(operation)).to.equal("Response | DefinedType");
  });

  it("Returns 'Response | void' on defined_type datatype, but with statusCode as 500", () => {
    const response: model.domain.Response = operation.responses[0];
    response.withStatusCode("500");
    response.payloads[0].schema.withName("DefinedType");
    expect(getReturnPayloadType(operation)).to.equal("Response | void");
  });

  it("Returns 'Response | void' without responses", () => {
    operation.withResponses([]);
    expect(getReturnPayloadType(operation)).to.equal("Response | void");
  });

  it("Returns 'Response | void' datatype, with response array but with no response codes", () => {
    expect(getReturnPayloadType(operation)).to.equal("Response | void");
  });
});

describe("Template helper tests for defined type properties", () => {
  it("Returns 'false' on undefined property", () => {
    assert.isFalse(isDefinedProperty(undefined));
  });

  it("Returns 'false' on undefined property range", () => {
    assert.isFalse(isDefinedProperty({}));
  });
});

describe("Template helper tests for primitive type properties", () => {
  it("Returns 'false' on undefined property", () => {
    assert.isFalse(isPrimitiveProperty(undefined));
  });

  it("Returns 'false' on undefined property range", () => {
    assert.isFalse(isPrimitiveProperty({}));
  });
});

describe("Template helper tests for object type properties", () => {
  it("Returns 'false' on undefined property", () => {
    assert.isFalse(isObjectProperty(undefined));
  });

  it("Returns 'false' on undefined property range", () => {
    assert.isFalse(isObjectProperty({}));
  });
});

describe("Template helper tests for Array type properties", () => {
  it("Returns 'false' on undefined property", () => {
    assert.isFalse(isArrayProperty(undefined));
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

describe("Template helper tests for defined types", () => {
  it("Returns 'false' on undefined range", () => {
    assert.isFalse(isTypeDefined(undefined));
  });

  it("Returns 'false' on null range property", () => {
    const property: model.domain.ScalarShape = new model.domain.ScalarShape();

    expect(isTypeDefined(property.dataType)).to.be.false;
  });

  it("Returns 'false' on presence of items property", () => {
    const property: model.domain.PropertyShape = new model.domain.PropertyShape();
    const range: model.domain.ArrayShape = new model.domain.ArrayShape();

    property.withRange(range);

    expect(isTypeDefined(property.range)).to.be.false;
  });

  it("Returns 'false' on inherits property not being an array", () => {
    const property: model.domain.PropertyShape = new model.domain.PropertyShape();
    const range: model.domain.ArrayShape = new model.domain.ArrayShape();

    property.withRange(range);

    expect(isTypeDefined(property.range)).to.be.false;
  });

  it("Returns 'false' on inherits array is empty", () => {
    const property: model.domain.PropertyShape = new model.domain.PropertyShape();
    const range: model.domain.ArrayShape = new model.domain.ArrayShape();

    property.withRange(range);

    expect(isTypeDefined(property.range)).to.be.false;
  });

  it("Returns 'false' on inherited item is not linked", () => {
    const property = {
      range: {
        inherits: [
          {
            isLink: false
          }
        ]
      }
    };
    assert.isFalse(isTypeDefined(property.range));
  });

  it("Returns 'false' on inherited item does not have a link target", () => {
    const property = {
      range: {
        inherits: [
          {
            isLink: true
          }
        ]
      }
    };
    assert.isFalse(isTypeDefined(property.range));
  });

  it("Returns 'false' on inherited item does not have linkTarget name", () => {
    const property = {
      range: {
        inherits: [
          {
            isLink: true,
            linkTarget: {}
          }
        ]
      }
    };
    assert.isFalse(isTypeDefined(property.range));
  });

  it("Returns 'false' on inherited item does not have linkTarget name's value function", () => {
    const property = {
      range: {
        inherits: [
          {
            isLink: true,
            linkTarget: {
              name: {}
            }
          }
        ]
      }
    };
    assert.isFalse(isTypeDefined(property.range));
  });

  it("Returns 'true' on inherited item have linkTarget name's value function", () => {
    const property = {
      range: {
        inherits: [
          {
            isLink: true,
            linkTarget: {
              name: {
                value: () => "defined_type"
              }
            }
          }
        ]
      }
    };
    assert.isTrue(isTypeDefined(property.range));
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

describe("Template helper tests for getAdditionalProperties", () => {
  before(() => {
    return AMF.init();
  });

  it("Returns empty array on undefined model", () => {
    expect(getAdditionalProperties(undefined)).to.be.empty;
  });

  it("Returns empty array on null model", () => {
    expect(getAdditionalProperties(null)).to.be.empty;
  });

  it("Returns empty array on model containing only required property", () => {
    const property: model.domain.PropertyShape = new model.domain.PropertyShape();
    property.withName("required");
    property.withMinCount(1);
    const typeDto = new model.domain.NodeShape();
    typeDto.withProperties([property]);

    expect(getAdditionalProperties(typeDto)).to.be.empty;
  });

  it("Returns empty array on model containing only optional property", () => {
    const property1: model.domain.PropertyShape = new model.domain.PropertyShape();
    property1.withName("optional1");
    property1.withMinCount(0);
    const typeDto = new model.domain.NodeShape();
    typeDto.withProperties([property1]);

    expect(getAdditionalProperties(typeDto)).to.be.empty;
  });

  it("Returns a array of length 1 on model containing only additional property", () => {
    const property1: model.domain.PropertyShape = new model.domain.PropertyShape();
    property1.withName("//");
    property1.withMinCount(0);
    const typeDto = new model.domain.NodeShape();
    typeDto.withProperties([property1]);

    expect(getAdditionalProperties(typeDto)).to.be.length(1);
  });

  it("Returns array of length 1 on model containing only additional property with regex /.*/", () => {
    const property1: model.domain.PropertyShape = new model.domain.PropertyShape();
    property1.withName("/.*/");
    property1.withMinCount(0);
    const typeDto = new model.domain.NodeShape();
    typeDto.withProperties([property1]);

    expect(getAdditionalProperties(typeDto)).to.be.length(1);
  });

  it("Returns array of length 1 on classes containing one additional property, one required property and one optional property", () => {
    const additional: model.domain.PropertyShape = new model.domain.PropertyShape();
    const required: model.domain.PropertyShape = new model.domain.PropertyShape();
    const optional: model.domain.PropertyShape = new model.domain.PropertyShape();
    additional.withName("//");
    required.withName("required1");
    required.withMinCount(0);
    optional.withName("optional1");
    optional.withMinCount(0);
    const typeDto = new model.domain.NodeShape();
    typeDto.withProperties([additional, required, optional]);

    const props: model.domain.PropertyShape[] = getAdditionalProperties(
      typeDto
    );
    expect(props).to.be.length(1);
    expect(props[0].name.value()).to.be.equal(additional.name.value());
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

  it("Returns empty array on model that contains no direct properties and no linked properties", () => {
    const typeDto = new model.domain.NodeShape();
    expect(getProperties(typeDto)).to.be.empty;
  });

  it("Returns an array of required and optional parameters on model containing required, optional and additional parameters", () => {
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

describe("Template helper tests for isTypeLinked", () => {
  before(() => {
    return AMF.init();
  });

  it("Returns false with null type", () => {
    expect(isTypeLinked(null)).to.be.false;
  });

  it("Returns false with undefined type", () => {
    expect(isTypeLinked(undefined)).to.be.false;
  });

  it("Returns false for type with no link", () => {
    const type = new model.domain.ScalarShape();
    expect(isTypeLinked(type)).to.be.false;
  });

  it("Returns true with the linked type", () => {
    const type = new model.domain.ScalarShape();
    const linkedType = new model.domain.ScalarShape();
    type.withLinkTarget(linkedType);
    expect(isTypeLinked(type)).to.be.true;
  });
});
