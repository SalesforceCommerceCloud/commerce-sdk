/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";
const Shop = require("../dist").Shop;
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

const expect = chai.expect;
let initializeMockPromise;
const BASE_URI =
  "https://anypoint.mulesoft.com/mocking/api/v1/sources/exchange/assets/893f605e-10e2-423a-bdb4-f952f56eb6d8/steelarc-integration/1.0.0/m/s/-/dw/shop/v19_5";

const client = new Shop({
  baseUri: BASE_URI
});

before(() => {
  chai.should();
  chai.use(chaiAsPromised);
  initializeMockPromise = client.initializeMockService();
});

describe("Shop client integratin get tests", () => {
  it("Throws error calling GET with no token", () => {
    const newLocalClient = new Shop({
      baseUri: BASE_URI
    });
    return expect(newLocalClient.getSite()).to.be.rejected;
  });

  it("Returns object calling GET with token", () => {
    return initializeMockPromise.then(() => {
      return client.getSite().then(s => {
        expect(s).to.deep.equal({
          // eslint-disable-next-line @typescript-eslint/camelcase
          allowed_currencies: [],
          // eslint-disable-next-line @typescript-eslint/camelcase
          allowed_locales: [{}]
        });
      });
    });
  });
});
