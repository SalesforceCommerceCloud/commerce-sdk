/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";

import { expect } from "chai";
import * as lib from "webapi-parser";
const wap = lib.WebApiParser;
const domain = lib.model.domain;

import { getBaseUriParameters } from "../src/template-helpers";

describe("Test getBaseUriParameters template helper function", () => {
  before(() => wap.init());

  it("returns an empty array for null input", () => {
    expect(getBaseUriParameters(null)).to.deep.equal([]);
  });

  it("returns an empty array for empty model", () => {
    expect(getBaseUriParameters(new lib.webapi.WebApiDocument())).to.deep.equal(
      []
    );
  });

  it("returns an empty array for static uri", () => {
    const api = new domain.WebApi();
    api.withServer("https://test-url-value");
    const model = new lib.webapi.WebApiDocument().withEncodes(api);
    expect(getBaseUriParameters(model)).to.deep.equal([]);
  });

  it("returns correct base parameter for one parameter", () => {
    const server = new domain.Server();
    server.withVariable("test");
    const api = new domain.WebApi();
    api.withServers([server]);
    const model = new lib.webapi.WebApiDocument().withEncodes(api);
    expect(getBaseUriParameters(model)).to.deep.equal(["test"]);
  });

  it("returns correct base parameter for parameters", () => {
    const server = new domain.Server();
    server.withVariable("test");
    server.withVariable("test-2");
    const api = new domain.WebApi();
    api.withServers([server]);
    const model = new lib.webapi.WebApiDocument().withEncodes(api);
    expect(getBaseUriParameters(model)).to.deep.equal(["test", "test-2"]);
  });
});
