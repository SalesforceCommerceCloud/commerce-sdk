/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";

import {
  NamedObject,
  getName,
  getCamelCaseName,
  getPascalCaseName,
} from "../src/templateHelpers";

import { expect } from "chai";

describe("Template helper tests for name helpers", () => {
  const createNamedObject = (name: string): NamedObject => ({
    name: { value: (): string => name },
  });
  const capitalStr = "Foo Bar";
  const camelStr = "fooBar";
  const pascalStr = "FooBar";
  const snakeStr = "foo_bar";
  const emptyStr = "";
  const capitalObj = createNamedObject(capitalStr);
  const camelObj = createNamedObject(camelStr);
  const pascalObj = createNamedObject(pascalStr);
  const snakeObj = createNamedObject(snakeStr);
  const emptyObj = createNamedObject(emptyStr);
  const invalids = [
    undefined,
    null,
    "foo bar",
    {},
    { name: {} },
    { name: { value: null } },
  ];
  describe("Basic name getter", () => {
    it("Returns unmodified name for valid inputs", () => {
      expect(getName(capitalObj)).to.equal(capitalStr);
      expect(getName(camelObj)).to.equal(camelStr);
      expect(getName(pascalObj)).to.equal(pascalStr);
      expect(getName(snakeObj)).to.equal(snakeStr);
      expect(getName(emptyObj)).to.equal(emptyStr);
    });
    it("Returns empty string for invalid inputs", () => {
      invalids.forEach((item) =>
        expect(getName(item as NamedObject)).to.equal(emptyStr)
      );
    });
  });
  describe("camelCase name getter", () => {
    it("Returns camelCase name for valid inputs", () => {
      expect(getCamelCaseName(capitalObj)).to.equal(camelStr);
      expect(getCamelCaseName(camelObj)).to.equal(camelStr);
      expect(getCamelCaseName(pascalObj)).to.equal(camelStr);
      expect(getCamelCaseName(snakeObj)).to.equal(camelStr);
      expect(getCamelCaseName(emptyObj)).to.equal(emptyStr);
    });
    it("Returns empty string for invalid inputs", () => {
      invalids.forEach((item) =>
        expect(getName(item as NamedObject)).to.equal(emptyStr)
      );
    });
  });

  describe("PascalCase name getter", () => {
    it("Returns PascalCase name for valid inputs", () => {
      expect(getPascalCaseName(capitalObj)).to.equal(pascalStr);
      expect(getPascalCaseName(camelObj)).to.equal(pascalStr);
      expect(getPascalCaseName(pascalObj)).to.equal(pascalStr);
      expect(getPascalCaseName(snakeObj)).to.equal(pascalStr);
      expect(getPascalCaseName(emptyObj)).to.equal(emptyStr);
    });
    it("Returns empty string for invalid inputs", () => {
      invalids.forEach((item) =>
        expect(getName(item as NamedObject)).to.equal(emptyStr)
      );
    });
  });
});
