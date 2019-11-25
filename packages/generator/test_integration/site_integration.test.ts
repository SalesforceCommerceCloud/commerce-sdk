/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";
import { ResponseError } from "@commerce-sdk/core";

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

describe("Shop client integration GET tests", () => {
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

  it("Returns object calling GET with token and unknown query parameter", () => {
    return initializeMockPromise.then(() => {
      // eslint-disable-next-line @typescript-eslint/camelcase
      return client.getSite({ unknown_parameter: "unknown_value" }).then(s => {
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

describe("Shop client integration PUT tests", () => {
  it("Throws error calling PUT with no token", () => {
    const newLocalClient = new Shop({
      baseUri: BASE_URI
    });
    return expect(
      newLocalClient.updateCustomerPassword({
        // eslint-disable-next-line @typescript-eslint/camelcase
        current_password: "Current Password",
        password: "New Password"
      })
    ).to.be.rejected;
  });

  it("Throws error calling PUT without required body", () => {
    return initializeMockPromise.then(() => {
      expect(client.updateCustomerPassword()).to.be.rejected;
    });
  });

  it("Throws error calling PUT without required body param", () => {
    return initializeMockPromise.then(() => {
      expect(client.updateCustomerPassword({})).to.be.rejected;
    });
  });

  it("Throws error calling PUT with invalid body parameter", () => {
    return initializeMockPromise.then(() => {
      expect(
        client.updateCustomerPassword({
          // eslint-disable-next-line @typescript-eslint/camelcase
          invalid_key: "This key is invalid",
          password: ""
        })
      ).to.be.rejected;
    });
  });

  it("Returns object calling PUT with valid token and request body", () => {
    return initializeMockPromise.then(() => {
      expect(
        client.updateCustomerPassword({
          // eslint-disable-next-line @typescript-eslint/camelcase
          current_password: "Current password",
          password: ""
        })
      ).to.deep.equal({});
    });
  });
});

describe("Shop client integration PATCH tests", () => {
  it("Throws error calling PATCH with no token", () => {
    const newLocalClient = new Shop({
      baseUri: BASE_URI
    });
    return expect(
      newLocalClient.updateCustomerProductListItem({ itemId: "item_id" }, {})
    ).to.be.rejected;
  });

  it("Throws error calling PATCH without required template parameter", () => {
    return initializeMockPromise.then(() => {
      // eslint-disable-next-line @typescript-eslint/camelcase
      try {
        client.updateCustomerProductListItem();
      } catch (e) {
        expect(e).to.equal(
          "TypeError: Cannot read property 'itemId' of undefined"
        );
      }
    });
  });

  it("Returns object calling PATCH with required template parameter", () => {
    return initializeMockPromise.then(() => {
      expect(
        client.updateCustomerProductListItem({ itemId: "item_id" }, {})
      ).should.eventually.deep.equal({});
    });
  });
});

describe("Shop client integration DELETE tests", () => {
  it("Throws error calling DELETE with no token", () => {
    const newLocalClient = new Shop({
      baseUri: BASE_URI
    });
    return expect(newLocalClient.deleteSite()).to.be.rejected;
  });

  it("Returns object calling DELETE with valid token", () => {
    return initializeMockPromise.then(() => {
      expect(client.deleteSite()).should.eventually.deep.equal({});
    });
  });
});

describe("Shop client integration POST tests", () => {
  it("Throws error calling POST with no token", () => {
    const newLocalClient = new Shop({
      baseUri: BASE_URI
    });
    return expect(newLocalClient.searchProducts()).to.be.rejected;
  });

  it("Throws error calling POST with valid out required request body", () => {
    return initializeMockPromise.then(() => {
      expect(client.searchProducts()).to.be.rejected;
    });
  });

  it("Throws error calling POST with valid out valid enum", () => {
    return initializeMockPromise.then(() => {
      expect(
        client.searchProducts({
          count: 1,
          // eslint-disable-next-line @typescript-eslint/camelcase
          db_start_record_: 0,
          expand: [""],
          query: {},
          select: "",
          // eslint-disable-next-line @typescript-eslint/camelcase
          sorts: [{ field: "", sort_order: "0" }],
          start: 0
        })
      ).to.be.rejected;
    });
  });

  it("Throws error calling POST with valid out valid query object", () => {
    return initializeMockPromise.then(() => {
      expect(
        client.searchProducts({
          count: 1,
          // eslint-disable-next-line @typescript-eslint/camelcase
          db_start_record_: 0,
          expand: [""],
          query: "",
          select: "",
          // eslint-disable-next-line @typescript-eslint/camelcase
          sorts: [{ field: "", sort_order: "asc" }],
          start: 0
        })
      ).to.be.rejected;
    });
  });

  it("Returns object calling POST with valid token and valid request body", () => {
    return initializeMockPromise.then(() => {
      expect(
        client.searchProducts({
          count: 1,
          // eslint-disable-next-line @typescript-eslint/camelcase
          db_start_record_: 0,
          expand: [""],
          query: {},
          select: "",
          // eslint-disable-next-line @typescript-eslint/camelcase
          sorts: [{ field: "", sort_order: "asc" }],
          start: 0
        })
      ).should.eventually.deep.equal({});
    });
  });
});
