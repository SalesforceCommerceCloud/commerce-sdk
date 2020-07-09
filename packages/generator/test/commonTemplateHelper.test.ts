/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from "chai";
import { addNamespace } from "../src/commonTemplateHelper";

describe("When adding namespaces to individual types", () => {
  it("Should prefix the types namespace when provided with any string ", () => {
    expect(addNamespace("foo", "types"))
      .to.be.a("string")
      .and.equal("types.foo");
  });

  it("should not prefix void with types namespace", () => {
    expect(addNamespace("void", "types"))
      .to.be.a("string")
      .and.equal("void");
  });

  it("should not prefix object with a namespace", () => {
    expect(addNamespace("object", "types"))
      .to.be.a("string")
      .and.equal("object");
  });

  it("should not prefix Object with a namespace", () => {
    expect(addNamespace("object", "types"))
      .to.be.a("string")
      .and.equal("object");
  });

  it("should throw an error if called with undfined content", () => {
    expect(() => addNamespace(null, "types")).to.throw("Invalid content");
  });

  it("should throw an error if called with null content", () => {
    expect(() => addNamespace(undefined, "types")).to.throw("Invalid content");
  });

  it("should throw an error if the type is not a valid string", () => {
    expect(() => addNamespace("Foo", null)).to.throw("Invalid namespace");
  });
});

describe("When adding namespaces to elements in an array", () => {
  it("should prefix each element with a namespace", () => {
    expect(addNamespace("Array<Foo | Baa>", "types"))
      .to.be.a("string")
      .and.equal("Array<types.Foo | types.Baa>");
  });

  it("should correctly parse three elements in an array", () => {
    expect(addNamespace("Array<Foo | Baa | Bar>", "types"))
      .to.be.a("string")
      .and.equal("Array<types.Foo | types.Baa | types.Bar>");
  });

  it("should correctly parse no elements in an array", () => {
    expect(() => addNamespace("Array<>", null)).to.throw();
  });

  it("should not add a type to an empty array element", () => {
    expect(() => addNamespace("Array<Foo | | Baa>", null)).to.throw();
  });
});
