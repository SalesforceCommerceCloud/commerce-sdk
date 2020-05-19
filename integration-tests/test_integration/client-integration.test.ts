/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";
import { Checkout} from "commerce-sdk";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { assert, IsExact } from "conditional-type-checks";
import { stripBearer } from "@commerce-apps/core";

const BASE_URI =
  "https://anypoint.mulesoft.com/mocking/api/v1/sources/exchange/assets/893f605e-10e2-423a-bdb4-f952f56eb6d8/steelarc-integration/1.0.0/m/s/-/dw/shop/v19_5";

const shopperBaskets = new Checkout.ShopperBaskets({
  baseUri: BASE_URI
});

// let test: Shop;
before(() => {
  chai.use(chaiAsPromised);
});

describe("Shop client integration GET tests", () => {
  it("Throws error calling GET with no token", () => {

    expect(stripBearer("Bearer 123456")).to.equal("123456");


    const newLocalClient = new Checkout.ShopperBaskets({
      baseUri: BASE_URI
    });
    return expect(newLocalClient.getBasket({ parameters: { organizationId: "org-id", basketId: "basket-id", siteId: "site-id" }})).to.be.rejected;
  });
})