/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from "chai";
import {
  addNamespace,
  formatForTsDoc,
  isCommonPathParameter,
  isCommonQueryParameter,
} from "./templateHelpers";
import { commonParameterPositions } from "@commerce-apps/core";

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

describe("Test formatForTsDoc template help function", () => {
  it("returns empty string for empty string", () => {
    expect(formatForTsDoc("")).to.equal("");
  });

  it('returns "test" for "test"', () => {
    expect(formatForTsDoc("test")).to.equal("test");
  });

  it("returns already escaped tag", () => {
    expect(formatForTsDoc("this is a \\<tag\\>")).to.equal(
      "this is a \\<tag\\>"
    );
  });

  it("returns escaped tag in brackets", () => {
    expect(formatForTsDoc("my {<tag>}")).to.equal("my \\{\\<tag\\>\\}");
  });

  it("returns escaped tag for html", () => {
    expect(formatForTsDoc("this is a <tag>")).to.equal("this is a \\<tag\\>");
  });

  it("returns escaped brackets for brackets", () => {
    expect(formatForTsDoc("this is {escaped}")).to.equal(
      "this is \\{escaped\\}"
    );
  });

  it("returns unescaped newlines for escapeed newlines", () => {
    expect(formatForTsDoc("this is a newline\\n")).to.equal(
      "this is a newline\n"
    );
  });

  it("returns newlines for newlines", () => {
    expect(formatForTsDoc("this is a newline\n")).to.equal(
      "this is a newline\n"
    );
  });

  it("returns unescaped tabs for escaped tabs", () => {
    expect(formatForTsDoc("this is a\\ttab")).to.equal("this is a tab");
  });

  it("returns tabs for tabs", () => {
    expect(formatForTsDoc("this is a\ttab")).to.equal("this is a\ttab");
  });

  it("returns leading whitespace for 1 space in front", () => {
    expect(formatForTsDoc("\n this is an indented line")).to.equal(
      "\n this is an indented line"
    );
  });

  it("returns leading whitespace for 3 spaces in front", () => {
    expect(formatForTsDoc("\n   this is an indented line")).to.equal(
      "\n   this is an indented line"
    );
  });

  it("returns collapsed leading whitespace for 5 spaces in front", () => {
    expect(formatForTsDoc("\n     this is an indented line")).to.equal(
      "\n   this is an indented line"
    );
  });

  it("returns whitespace for 5 spaces in middle", () => {
    expect(formatForTsDoc("\nthis is a spaced     line")).to.equal(
      "\nthis is a spaced     line"
    );
  });
});

describe("Test isCommonPathParameter template help function", () => {
  it("returns false for null input", () => {
    expect(isCommonPathParameter(null)).to.be.false;
  });

  it("returns false for empty string", () => {
    expect(isCommonPathParameter("")).to.be.false;
  });

  it("returns false for not a common parameter", () => {
    expect(isCommonPathParameter("not-a-common-parameter")).to.be.false;
  });

  it("returns true for a common parameter", () => {
    expect(isCommonPathParameter(commonParameterPositions.pathParameters[0])).to
      .be.true;
  });

  it("returns true for all common parameter", () => {
    commonParameterPositions.pathParameters.forEach((p) => {
      expect(isCommonPathParameter(p)).to.be.true;
    });
  });
});

describe("Test isCommonQueryParameter template help function", () => {
  it("returns false for null input", () => {
    expect(isCommonQueryParameter(null)).to.be.false;
  });

  it("returns false for empty string", () => {
    expect(isCommonQueryParameter("")).to.be.false;
  });

  it("returns false for not a common parameter", () => {
    expect(isCommonQueryParameter("not-a-common-parameter")).to.be.false;
  });

  it("returns true for a common parameter", () => {
    expect(isCommonQueryParameter(commonParameterPositions.queryParameters[0]))
      .to.be.true;
  });

  it("returns true for all common parameter", () => {
    commonParameterPositions.queryParameters.forEach((p) => {
      expect(isCommonQueryParameter(p)).to.be.true;
    });
  });
});
