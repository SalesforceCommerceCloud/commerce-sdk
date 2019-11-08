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
  onlyRequired
} from "../src/template-helpers";

import { assert } from "chai";

describe("Template helper primitive datatype tests", () => {
  it("Returns 'any' on undefined property", () => {
    assert.isTrue(getDataType(undefined) === "any");
  });

  it("Returns 'boolean' on boolean dataType", () => {
    const property = {
      range: {
        dataType: {
          value: () => "http://www.w3.org/2001/XMLSchema#boolean"
        }
      }
    };

    assert.isTrue(getDataType(property) === "boolean");
  });

  it("Returns 'number' on float dataType", () => {
    const property = {
      range: {
        dataType: { value: () => "http://www.w3.org/2001/XMLSchema#float" }
      }
    };

    assert.isTrue(getDataType(property) === "number");
  });

  it("Returns 'any' on undefined dataType", () => {
    const property = {
      range: {
        dataType: { value: () => undefined }
      }
    };
    assert.isTrue(getDataType(property) === "any");
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
    const property = {
      range: {
        items: {
          dataType: { value: () => "unknown" }
        }
      }
    };
    assert.isTrue(getDataType(property) === "Array<any>");
  });

  it("Returns 'Array<string>' on array of string dataType", () => {
    const property = {
      range: {
        items: {
          dataType: { value: () => "http://www.w3.org/2001/XMLSchema#string" }
        }
      }
    };
    assert.isTrue(getDataType(property) === "Array<string>");
  });

  it("Returns 'Array<number>' on array of double dataType", () => {
    const property = {
      range: {
        items: {
          dataType: { value: () => "http://www.w3.org/2001/XMLSchema#double" }
        }
      }
    };
    assert.isTrue(getDataType(property) === "Array<number>");
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
    const property = {
      range: {
        items: {
          dataType: {
            value: () => "http://www.w3.org/2001/XMLSchema#string"
          }
        }
      }
    };
    assert.isTrue(getArrayElementTypeProperty(property) === "string");
  });
});

describe("Template helper tests array literal definitions like string[], defined_type[], ettc", () => {
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
  it("Returns 'Response' on unknown datatype", () => {
    const operation = {
      responses: [
        {
          statusCode: {
            value: () => "200"
          },
          payloads: [
            {
              mediaType: {
                value: () => "application/json"
              },
              schema: {
                inherits: [
                  {
                    isLink: true,
                    linkTarget: {
                      name: {
                        value1: () => ""
                      }
                    }
                  }
                ]
              }
            }
          ]
        }
      ]
    };
    assert.isTrue(getReturnPayloadType(operation) === "Response");
  });

  it("Returns 'defined_type' on defined_type datatype", () => {
    const operation = {
      responses: [
        {
          statusCode: {
            value: () => "200"
          },
          payloads: [
            {
              mediaType: {
                value: () => "application/json"
              },
              schema: {
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
          ]
        }
      ]
    };
    assert.isTrue(getReturnPayloadType(operation) === "defined_type");
  });

  it("Returns 'Response' on defined_type datatype, but with statusCode as 500", () => {
    const operation = {
      responses: [
        {
          statusCode: {
            value: () => "500"
          },
          payloads: [
            {
              mediaType: {
                value: () => "application/json"
              },
              schema: {
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
          ]
        }
      ]
    };
    assert.isTrue(getReturnPayloadType(operation) === "Response");
  });

  it("Returns 'Response' on defined_type datatype, but without responses array", () => {
    const operation = {
      responses1: [
        {
          statusCode: {
            value: () => "200"
          },
          payloads: [
            {
              mediaType: {
                value: () => "application/json"
              },
              schema: {
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
          ]
        }
      ]
    };
    assert.isTrue(getReturnPayloadType(operation) === "Response");
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
    assert.isNull(getValue({}));
  });

  it("Returns 'valid' on valie value", () => {
    assert.equal(
      "valid",
      getValue({
        value: () => "valid"
      })
    );
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
    assert.isEmpty(
      onlyRequired([
        {
          minCount: {
            value: () => 0
          }
        }
      ])
    );
  });
  it("Returns non empty array on valid required classes", () => {
    assert.isNotEmpty(
      onlyRequired([
        {
          minCount: {
            value: () => 1
          }
        }
      ])
    );
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
    assert.isEmpty(
      onlyOptional([
        {
          minCount: {
            value: () => 1
          }
        }
      ])
    );
  });
  it("Returns non empty array on valid optional properties", () => {
    assert.isNotEmpty(
      onlyOptional([
        {
          minCount: {
            value: () => 0
          }
        }
      ])
    );
  });
});

describe("Template helper tests for defined types", () => {
  it("Returns 'false' on undefined range", () => {
    assert.isFalse(isTypeDefined(undefined));
  });

  it("Returns 'false' on null range property", () => {
    assert.isFalse(isTypeDefined({}));
  });

  it("Returns 'false' on presence of items property", () => {
    const property = {
      range: {
        items: {}
      }
    };
    assert.isFalse(isTypeDefined(property.range));
  });

  it("Returns 'false' on inherits property not being an array", () => {
    const property = {
      range: {
        inherits: {}
      }
    };
    assert.isFalse(isTypeDefined(property.range));
  });

  it("Returns 'false' on inherits array is empty", () => {
    const property = {
      range: {
        inherits: []
      }
    };
    assert.isFalse(isTypeDefined(property.range));
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

  it("Returns 'false' on inherited item does not have linkTarget name's value functioon", () => {
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

  it("Returns 'true' on inherited item have linkTarget name's value functioon", () => {
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
