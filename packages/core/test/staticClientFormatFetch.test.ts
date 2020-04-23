/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";

import chai from "chai";

const expect = chai.expect;

before(() => {
  chai.should();
});

import { formatFetchForInfoLog } from "../src/base/staticClient";

describe("format fetch for info log tests", () => {
  it("formats basic get correctly", () => {
    const resource:string = "https://example.com/my/endpoint";
    const options = { method: "GET" };
    const output = "Request: GET https://example.com/my/endpoint";
    return expect(formatFetchForInfoLog(resource, options)).to.eql(output);
  })

  it("formats get with query params correctly", () => {
    const resource:string = "https://example.com/my/endpoint?myparam=value";
    const options = { method: "GET" };
    const output = "Request: GET https://example.com/my/endpoint?myparam=value";
    return expect(formatFetchForInfoLog(resource, options)).to.eql(output);
  })

  it("formats basic POST correctly", () => {
    const resource:string = "https://example.com/my/endpoint";
    const options = { method: "POST" };
    const output = "Request: POST https://example.com/my/endpoint";
    return expect(formatFetchForInfoLog(resource, options)).to.eql(output);
  })
});