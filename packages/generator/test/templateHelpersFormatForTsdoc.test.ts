/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";

import { expect } from "chai";

import { formatForTsDoc } from "../src/templateHelpers";

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
