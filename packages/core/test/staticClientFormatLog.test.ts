/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";

import { Response, Headers } from "minipass-fetch";
import sinon from "sinon";
import fetchToCurl from "fetch-to-curl";

import { logFetchInfo, logResponseInfo } from "../src/base/staticClient";
import { sdkLogger } from "../src/base/sdkLogger";

let logLevel;
before(() => {
  logLevel = sdkLogger.getLevel();
});
after(() => {
  //reset log level
  sdkLogger.setLevel(logLevel);
});

describe("Test info log messages of fetch data", () => {
  let spy;
  before(() => {
    sdkLogger.setLevel(sdkLogger.levels.INFO);
    spy = sinon.spy(sdkLogger, "info");
  });
  after(() => {
    sinon.reset();
  });
  it("formats basic get correctly", () => {
    const resource = "https://example.com/my/endpoint";
    const options = { method: "GET" };
    const output = "Request: GET https://example.com/my/endpoint";
    logFetchInfo(resource, options);
    sinon.assert.calledWith(spy, output);
  });

  it("formats get with query params correctly", () => {
    const resource = "https://example.com/my/endpoint?myparam=value";
    const options = { method: "GET" };
    const output = "Request: GET https://example.com/my/endpoint?myparam=value";
    logFetchInfo(resource, options);
    sinon.assert.calledWith(spy, output);
  });

  it("formats basic POST correctly", () => {
    const resource = "https://example.com/my/endpoint";
    const options = { method: "POST" };
    const output = "Request: POST https://example.com/my/endpoint";
    logFetchInfo(resource, options);
    sinon.assert.calledWith(spy, output);
  });
});

function getDebugMsgForFetch(resource, options): string {
  return `Request URI: ${resource}\nFetch Options: ${JSON.stringify(
    options,
    null,
    2
  )}\nCurl: ${fetchToCurl(resource, options)}`;
}
describe("Test debug log messages of fetch data", () => {
  let spy;
  before(() => {
    sdkLogger.setLevel(sdkLogger.levels.DEBUG);
    spy = sinon.spy(sdkLogger, "debug");
  });
  after(() => {
    sinon.reset();
  });
  it("formats basic get correctly", () => {
    const resource = "https://example.com/my/endpoint";
    const options = { method: "GET" };
    logFetchInfo(resource, options);
    sinon.assert.calledWith(spy, getDebugMsgForFetch(resource, options));
  });

  it("formats get with query params correctly", () => {
    const resource = "https://example.com/my/endpoint?myparam=value";
    const options = { method: "GET" };
    logFetchInfo(resource, options);
    sinon.assert.calledWith(spy, getDebugMsgForFetch(resource, options));
  });

  it("formats basic POST correctly", () => {
    const resource = "https://example.com/my/endpoint";
    const options = {
      method: "POST",
      body: JSON.stringify({ key1: "value1" })
    };
    logFetchInfo(resource, options);
    sinon.assert.calledWith(spy, getDebugMsgForFetch(resource, options));
  });
  it("Masks password property in POST data", () => {
    const resource = "https://example.com/my/endpoint";
    const body = { key1: "value1", password: "test" };
    const options = {
      method: "POST",
      body: JSON.stringify(body)
    };
    logFetchInfo(resource, options);

    body.password = "****";
    options.body = JSON.stringify(body);
    sinon.assert.calledWith(spy, getDebugMsgForFetch(resource, options));
  });
  it("Masks property containing 'password' in name", () => {
    const resource = "https://example.com/my/endpoint";
    const body = {
      key1: "value1",
      currentPassword: "test",
      newPassword: "test"
    };
    const options = {
      method: "POST",
      body: JSON.stringify(body)
    };
    logFetchInfo(resource, options);

    body.currentPassword = "****";
    body.newPassword = "****";
    options.body = JSON.stringify(body);
    sinon.assert.calledWith(spy, getDebugMsgForFetch(resource, options));
  });
});

describe("Test info log messages of response data", () => {
  let spy;
  before(() => {
    sdkLogger.setLevel(sdkLogger.levels.INFO);
    spy = sinon.spy(sdkLogger, "info");
  });
  after(() => {
    sinon.reset();
  });
  it("formats success response correctly", () => {
    const response: Response = new Response(
      {},
      { status: 200, statusText: "Everything is ok" }
    );
    const output = "Response: successful 200 Everything is ok";
    logResponseInfo(response);
    sinon.assert.calledWith(spy, output);
  });

  it("formats created response correctly", () => {
    const response: Response = new Response(
      {},
      { status: 201, statusText: "Everything is created" }
    );
    const output = "Response: successful 201 Everything is created";
    logResponseInfo(response);
    sinon.assert.calledWith(spy, output);
  });

  it("formats not modified response correctly", () => {
    const response: Response = new Response(
      {},
      { status: 304, statusText: "Everything is the same" }
    );
    const output = "Response: successful 304 Everything is the same";
    logResponseInfo(response);
    sinon.assert.calledWith(spy, output);
  });

  it("formats 404 response correctly", () => {
    const response: Response = new Response(
      {},
      { status: 404, statusText: "Everything is gone" }
    );
    const output = "Response: unsuccessful 404 Everything is gone";
    logResponseInfo(response);
    sinon.assert.calledWith(spy, output);
  });
});

describe("Test debug log messages of response data", () => {
  let spy;
  before(() => {
    sdkLogger.setLevel(sdkLogger.levels.DEBUG);
    spy = sinon.spy(sdkLogger, "debug");
  });
  after(() => {
    sinon.reset();
  });
  it("formats response with headers correctly", () => {
    const respHeaders = new Headers();
    respHeaders.append("Content-Type", "application/json");
    const response: Response = new Response(
      {},
      { status: 200, statusText: "Everything is ok", headers: respHeaders }
    );

    const output = `Response: successful 200 Everything is ok\nResponse Headers: ${JSON.stringify(
      respHeaders.raw(),
      null,
      2
    )}`;
    logResponseInfo(response);
    sinon.assert.calledWith(spy, output);
  });
});
