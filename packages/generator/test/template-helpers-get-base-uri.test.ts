/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";

import { expect } from "chai";
import { default as amf, model } from "amf-client-js";

import { getBaseUri } from "../src/templateHelpers";

amf.plugins.document.WebApi.register();

describe("Test getBaseUri template help function", () => {
  it("returns an empty string for null input", () => {
    expect(getBaseUri(null)).to.equal("");
  });

  it("returns an empty string for empty model", () => {
    expect(getBaseUri(new model.document.Document())).to.equal("");
  });

  it("returns correct base uri", async () => {
    const api: model.domain.WebApi = new model.domain.WebApi();
    api.withServer("test-url-value");
    const testModel = new model.document.Document().withEncodes(api);
    expect(getBaseUri(testModel)).to.equal("test-url-value");
  });
});
