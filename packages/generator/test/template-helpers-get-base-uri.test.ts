/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";

import { getBaseUri } from "../src/template-helpers";

import { model } from "amf-client-js";
import { expect } from "chai";
import { WebApiBaseUnit, webapi, WebApiParser, WebApiBaseUnitWithEncodesModel } from "webapi-parser";

describe("Test getBaseUri template help function", () => {
  it("returns an empty string for null input", () => {
    expect(getBaseUri(null)).to.equal("");
  });

  it("returns an empty string for empty model", () => {
    expect(getBaseUri(new webapi.WebApiDocument())).to.equal("");
  });

  it("returns correct base uri", async () => {
    const w:WebApiBaseUnit = await WebApiParser.raml10.parse(`file://${__dirname}/raml/valid/site.raml`);
    const baseUri:string = ((w as WebApiBaseUnitWithEncodesModel).encodes as model.domain.WebApi).servers[0].url.value();
    expect(getBaseUri(w as WebApiBaseUnitWithEncodesModel)).to.equal(baseUri);
  });
});
