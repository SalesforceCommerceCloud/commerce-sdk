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
  onlyOptional,
  onlyRequired,
  getSecurityScheme
} from "../src/template-helpers";

import _ from "lodash";
import { assert, expect } from "chai";
import { model, AMF } from "amf-client-js";
import { AuthSchemes } from "@commerce-apps/core";

describe("Template helper primitive datatype tests", () => {
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
});

describe("Template helper Array item type tests", () => {
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

describe("Template helper tests for only required properties", () => {
  it("Returns empty array on undefined classes", () => {
    assert.isEmpty(onlyRequired(undefined));
  });

  it("Returns empty array on empty classes", () => {
    assert.isEmpty(onlyRequired([]));
  });

  it("Returns empty array on valid optional classes", () => {
    const property: model.domain.PropertyShape = new model.domain.PropertyShape();

    property.withMinCount(0);

    expect(onlyRequired([property])).to.be.empty;
  });

  it("Returns non empty array on valid required classes", () => {
    const property: model.domain.PropertyShape = new model.domain.PropertyShape();

    property.withMinCount(1);

    expect(onlyRequired([property])).to.not.be.empty;
  });
});

describe("Template helper tests for only optional properties", () => {
  it("Returns empty array on undefined classes", () => {
    assert.isEmpty(onlyOptional(undefined));
  });

  it("Returns empty array on empty classes", () => {
    assert.isEmpty(onlyOptional([]));
  });

  it("Returns empty array on valid required properties", () => {
    const property: model.domain.PropertyShape = new model.domain.PropertyShape();

    property.withMinCount(1);

    expect(onlyOptional([property])).to.be.empty;
  });

  it("Returns non empty array on valid optional properties", () => {
    const property: model.domain.PropertyShape = new model.domain.PropertyShape();

    property.withMinCount(0);

    expect(onlyOptional([property])).to.not.be.empty;
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

describe("Template helper tests for getSecurityScheme", () => {
  before(() => {
    return AMF.init();
  });

  it("Returns '' on undefined security scheme", () => {
    expect(getSecurityScheme("prefix", undefined)).to.be.empty;
  });

  it("Returns '' on empty security scheme", () => {
    const security: model.domain.SecurityRequirement[] = [];
    expect(getSecurityScheme("prefix", security)).to.be.empty;
  });

  it("Returns '' on empty security scheme without a define scheme", () => {
    const security: model.domain.SecurityRequirement[] = [];
    security.push(new model.domain.SecurityRequirement());
    expect(getSecurityScheme("prefix", security)).to.be.empty;
  });

  it("Returns '' on empty security scheme with a defined scheme that has no name", () => {
    const security: model.domain.SecurityRequirement[] = [
      new model.domain.SecurityRequirement()
    ];
    security[0].withScheme();
    expect(getSecurityScheme("prefix", security)).to.be.empty;
  });

  it("Returns '' on empty security scheme without a define scheme that we don't have", () => {
    const security: model.domain.SecurityRequirement[] = [
      new model.domain.SecurityRequirement()
    ];
    security[0].withScheme().withName("AuthType");
    expect(getSecurityScheme("prefix", security)).to.be.empty;
  });

  it("Returns the correct Auth when passed all of the valid ones", () => {
    const schemes = _.keys(AuthSchemes);

    schemes.forEach(schemeName => {
      const security: model.domain.SecurityRequirement[] = [
        new model.domain.SecurityRequirement()
      ];

      security[0].withScheme().withName(schemeName);
      expect(getSecurityScheme("prefix", security)).to.be.equal(
        `prefix this.authSchemes.${schemeName}`
      );
    });
  });
});
