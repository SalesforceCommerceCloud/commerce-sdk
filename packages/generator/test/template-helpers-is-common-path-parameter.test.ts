/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";

import { expect } from "chai";

import { commonParameterPositions } from "@commerce-apps/core";

import { isCommonPathParameter } from "../src/templateHelpers";

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
    commonParameterPositions.pathParameters.forEach(p => {
      expect(isCommonPathParameter(p)).to.be.true;
    });
  });
});
