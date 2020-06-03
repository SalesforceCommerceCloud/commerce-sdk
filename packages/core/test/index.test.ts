/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {
  BaseClient,
  CacheManagerRedis,
  ClientConfig,
  COMMERCE_SDK_LOGGER_KEY,
  commonParameterPositions,
  CommonParameters,
  getObjectFromResponse,
  Response,
  ResponseError,
  sdkLogger,
  shopperToken,
  StaticClient,
  stripBearer
} from "../src";

import chai from "chai";
const expect = chai.expect;

describe("test exports", () => {
  it("can import BaseClient", () => expect(BaseClient).to.exist);

  it("can import CacheManagerRedis", () => expect(CacheManagerRedis).to.exist);

  it("can import ClientConfig", () => expect(ClientConfig).to.exist);
 
  it("can import COMMERCE_SDK_LOGGER_KEY", () => expect(COMMERCE_SDK_LOGGER_KEY).to.exist);

  it("can import commonParameterPositions", () =>
    expect(commonParameterPositions).to.exist);

  it("can import getObjectFromResponse", () =>
    expect(getObjectFromResponse).to.exist);

  it("can import Response", () => expect(Response).to.exist);

  it("can import ResponseError", () => expect(ResponseError).to.exist);

  it("can import sdkLogger", () => expect(sdkLogger).to.exist);

  it("can import shopperToken", () => expect(shopperToken).to.exist);

  it("can import StaticClient.get", () => expect(StaticClient.get).to.exist);

  it("can import StaticClient.delete", () =>
    expect(StaticClient.delete).to.exist);

  it("can import StaticClient.patch", () =>
    expect(StaticClient.patch).to.exist);

  it("can import StaticClient.post", () => expect(StaticClient.post).to.exist);

  it("can import StaticClient.put", () => expect(StaticClient.put).to.exist);

  it("can import stripBearer", () => expect(stripBearer).to.exist);
});
