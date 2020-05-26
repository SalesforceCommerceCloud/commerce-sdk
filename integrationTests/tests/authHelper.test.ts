/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";
import chai, { expect } from "chai";
import { stripBearer } from "@commerce-apps/core";

describe("TS: Auth Helper Strip Bearer", () => {
  it("Successfully strips the prefix of `Bearer ` from the supplied string", () => {
    expect(stripBearer("Bearer 123456")).to.equal("123456");
  });
});
