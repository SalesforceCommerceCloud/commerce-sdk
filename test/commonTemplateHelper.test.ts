/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from "chai";
import { addNamespace } from "../src/commonTemplateHelper";

describe("When adding namespaces to individual content (types)", () => {
  it("Prefixes the namespace successfully ", () => {
    expect(addNamespace("foo", "types"))
      .to.be.a("string")
      .and.equal("types.foo");
  });

  it("Will not prefix void with a namespace", () => {
    expect(addNamespace("void", "types")).to.be.a("string").and.equal("void");
  });

  it("Will not prefix object with a namespace", () => {
    expect(addNamespace("object", "types"))
      .to.be.a("string")
      .and.equal("object");
  });

  it("Will not prefix Object with a namespace", () => {
    expect(addNamespace("object", "types"))
      .to.be.a("string")
      .and.equal("object");
  });

  it("Throws an error when called with undfined content", () => {
    expect(() => addNamespace(null, "types")).to.throw("Invalid content");
  });

  it("Throws an error when called with null content", () => {
    expect(() => addNamespace(undefined, "types")).to.throw("Invalid content");
  });

  it("Throws an error when the type is not a valid string", () => {
    expect(() => addNamespace("Foo", null)).to.throw("Invalid namespace");
  });
});

describe("When adding namespaces to elements in a complex content (an array)", () => {
  it("Prefixes each element with a namespace", () => {
    expect(addNamespace("Array<Foo | Baa>", "types"))
      .to.be.a("string")
      .and.equal("Array<types.Foo | types.Baa>");
  });

  it("Correctly parses three elements in an array", () => {
    expect(addNamespace("Array<Foo | Baa | Bar>", "types"))
      .to.be.a("string")
      .and.equal("Array<types.Foo | types.Baa | types.Bar>");
  });

  it("Throws an error when the array is empty", () => {
    expect(() => addNamespace("Array<>", null)).to.throw();
  });

  it("Throws an error when adding a type to an empty array element", () => {
    expect(() => addNamespace("Array<Foo | | Baa>", null)).to.throw();
  });
});
