/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";

import { expect } from "chai";

import { commonParameterPositions } from "@commerce-apps/core";

import { isCommonQueryParameter } from "../src/templateHelpers";

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
    commonParameterPositions.queryParameters.forEach(p => {
      expect(isCommonQueryParameter(p)).to.be.true;
    });
  });
});
