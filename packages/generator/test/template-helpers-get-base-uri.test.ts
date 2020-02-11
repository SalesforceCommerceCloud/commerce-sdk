/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";

import { expect } from "chai";
import * as lib from "webapi-parser";
const wap = lib.WebApiParser;
const domain = lib.model.domain;

import { getBaseUri } from "../src/templateHelpers";

describe("Test getBaseUri template help function", () => {
  before(() => wap.init());

  it("returns an empty string for null input", () => {
    expect(getBaseUri(null)).to.equal("");
  });

  it("returns an empty string for empty model", () => {
    expect(getBaseUri(new lib.webapi.WebApiDocument())).to.equal("");
  });

  it("returns correct base uri", async () => {
    const api = new domain.WebApi();
    api.withServer("test-url-value");
    const model = new lib.webapi.WebApiDocument().withEncodes(api);
    expect(getBaseUri(model)).to.equal("test-url-value");
  });
});
