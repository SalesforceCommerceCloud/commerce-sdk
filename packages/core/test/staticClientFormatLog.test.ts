/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";

import { Response } from "minipass-fetch";

import chai from "chai";

const expect = chai.expect;

before(() => {
  chai.should();
});

import {
  formatFetchForInfoLog,
  formatResponseForInfoLog
} from "../src/base/staticClient";

describe("format fetch for info log tests", () => {
  it("formats basic get correctly", () => {
    const resource = "https://example.com/my/endpoint";
    const options = { method: "GET" };
    const output = "Request: GET https://example.com/my/endpoint";
    return expect(formatFetchForInfoLog(resource, options)).to.eql(output);
  });

  it("formats get with query params correctly", () => {
    const resource = "https://example.com/my/endpoint?myparam=value";
    const options = { method: "GET" };
    const output = "Request: GET https://example.com/my/endpoint?myparam=value";
    return expect(formatFetchForInfoLog(resource, options)).to.eql(output);
  });

  it("formats basic POST correctly", () => {
    const resource = "https://example.com/my/endpoint";
    const options = { method: "POST" };
    const output = "Request: POST https://example.com/my/endpoint";
    return expect(formatFetchForInfoLog(resource, options)).to.eql(output);
  });
});

describe("format response for info log tests", () => {
  it("formats success response correctly", () => {
    const response: Response = new Response(
      {},
      { status: 200, statusText: "Everything is ok" }
    );
    const output = "Response: successful 200 Everything is ok";
    return expect(formatResponseForInfoLog(response)).to.eql(output);
  });

  it("formats created response correctly", () => {
    const response: Response = new Response(
      {},
      { status: 201, statusText: "Everything is created" }
    );
    const output = "Response: successful 201 Everything is created";
    return expect(formatResponseForInfoLog(response)).to.eql(output);
  });

  it("formats not modified response correctly", () => {
    const response: Response = new Response(
      {},
      { status: 304, statusText: "Everything is the same" }
    );
    const output = "Response: successful 304 Everything is the same";
    return expect(formatResponseForInfoLog(response)).to.eql(output);
  });

  it("formats 404 response correctly", () => {
    const response: Response = new Response(
      {},
      { status: 404, statusText: "Everything is gone" }
    );
    const output = "Response: unsuccessful 404 Everything is gone";
    return expect(formatResponseForInfoLog(response)).to.eql(output);
  });
});
