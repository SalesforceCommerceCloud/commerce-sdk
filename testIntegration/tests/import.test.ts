/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";
import chai from "chai";
import { expectType } from "tsd";
import { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import nock from "nock";
import { Customer } from "commerce-sdk";

before(() => {
  chai.use(chaiAsPromised);
});

describe("TS: Imports work", () => {
  afterEach(nock.cleanAll);

  it("imports Helpers and sdkLogger", async () => {
    return expect(import("commerce-sdk")).to.eventually.contain.keys([
      "helpers",
      "sdkLogger",
    ]);
  });

  it("imports type from merged namespace", async () => {
    // This type was selected for its simplicity
    expectType<Customer.ShopperCustomers.BasketsResult>({
      baskets: [],
      total: 0,
    });
  });
});
