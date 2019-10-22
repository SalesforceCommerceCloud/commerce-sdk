"use strict";

import { mapToTypeScriptDataType } from "../../src/utils/renderer";

import { assert } from "chai";

describe("Renderer tests", () => {
  it("Returns 'any' on undefined dataType object", () => {
    assert.isTrue(mapToTypeScriptDataType(undefined) === "any");
  });

  it("Returns 'any' on empty string dataType", () => {
    assert.isTrue(mapToTypeScriptDataType("") === "any");
  });

  it("Returns 'any' on unknown string dataType", () => {
    assert.isTrue(mapToTypeScriptDataType("unknown") === "any");
  });

  it("Returns 'string' on string dataType", () => {
    assert.isTrue(
      mapToTypeScriptDataType({
        value: () => "http://www.w3.org/2001/XMLSchema#string"
      }) === "string"
    );
  });

  it("Returns 'number' on integer dataType", () => {
    assert.isTrue(
      mapToTypeScriptDataType({
        value: () => "http://www.w3.org/2001/XMLSchema#integer"
      }) === "number"
    );
  });

  it("Returns 'any' on function returning unknown dataType", () => {
    assert.isTrue(
      mapToTypeScriptDataType({
        value: () => "unknown"
      }) === "any"
    );
  });

  it("Returns 'any' on function returning undefined", () => {
    assert.isTrue(
      mapToTypeScriptDataType({
        value: () => undefined
      }) === "any"
    );
  });
});
