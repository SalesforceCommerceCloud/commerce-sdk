/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";
const chai = require("chai");
const { stripBearer } = require("@commerce-apps/core");

before(() => {
  chai.use(chaiAsPromised);
});

describe("JS: Auth Helper Strip Bearer", () => {
  it("Successfully strips the prefix of `Bearer ` from the supplied string", () => {
    chai.expect(stripBearer("Bearer 123456")).to.equal("123456");
  });
});
