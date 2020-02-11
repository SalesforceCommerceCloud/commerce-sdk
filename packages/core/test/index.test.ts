/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {
  BaseClient,
  ClientConfig,
  commonParameterPositions,
  CommonParameters,
  Response,
  ResponseError,
  StaticClient
} from "../src";

import chai from "chai";
const expect = chai.expect;

describe("test exports", () => {
  it("can import BaseClient", () => expect(BaseClient).to.exist);

  it("can import commonParameterPositions", () =>
    expect(commonParameterPositions).to.exist);

  it("can import Response", () => expect(Response).to.exist);

  it("can import ResponseError", () => expect(ResponseError).to.exist);

  it("can import StaticClient.get", () => expect(StaticClient.get).to.exist);

  it("can import StaticClient.delete", () =>
    expect(StaticClient.delete).to.exist);

  it("can import StaticClient.patch", () =>
    expect(StaticClient.patch).to.exist);

  it("can import StaticClient.post", () => expect(StaticClient.post).to.exist);

  it("can import StaticClient.put", () => expect(StaticClient.put).to.exist);
});
