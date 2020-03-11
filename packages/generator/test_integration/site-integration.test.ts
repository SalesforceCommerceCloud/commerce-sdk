/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";
import { Shop } from "../dist";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { assert, IsExact } from "conditional-type-checks";
const BASE_URI =
  "https://anypoint.mulesoft.com/mocking/api/v1/sources/exchange/assets/893f605e-10e2-423a-bdb4-f952f56eb6d8/steelarc-integration/1.0.0/m/s/-/dw/shop/v19_5";

const client = new Shop.ShopApi({
  baseUri: BASE_URI
});

// let test: Shop;
before(() => {
  chai.use(chaiAsPromised);

  return client.initializeMockService();
});

describe("Shop client integration GET tests", () => {
  it("Throws error calling GET with no token", () => {
    const newLocalClient = new Shop.ShopApi({
      baseUri: BASE_URI
    });

    return expect(newLocalClient.getSite()).to.be.rejected;
  });

  it("Returns object calling GET with token", () => {
    return client.getSite().then(s => {
      expect(s).to.deep.equal({
        // eslint-disable-next-line @typescript-eslint/camelcase
        allowed_currencies: [],
        // eslint-disable-next-line @typescript-eslint/camelcase
        allowed_locales: [{}]
      });
    });
  });

  it("Returns object calling - GET with token and unknown query parameter", () => {
    // eslint-disable-next-line @typescript-eslint/camelcase
    return client
      .getSite({
        // eslint-disable-next-line @typescript-eslint/camelcase
        parameters: { unknown_parameter: "unknown_value" }
      })
      .then(s => {
        expect(s).to.deep.equal({
          // eslint-disable-next-line @typescript-eslint/camelcase
          allowed_currencies: [],
          // eslint-disable-next-line @typescript-eslint/camelcase
          allowed_locales: [{}]
        });
      });
  });
});

describe("Shop client integration PUT tests", () => {
  it("Throws error calling PUT with no token", () => {
    const newLocalClient = new Shop.ShopApi({
      baseUri: BASE_URI
    });

    return expect(
      newLocalClient.updateCustomerPassword({
        body: {
          // eslint-disable-next-line @typescript-eslint/camelcase
          current_password: "Current Password",
          password: "New Password"
        }
      })
    ).to.be.rejected;
  });

  it("Returns object calling PUT with valid token and request body", () => {
    return client
      .updateCustomerPassword(
        {
          body: {
            // eslint-disable-next-line @typescript-eslint/camelcase
            current_password: "Current password",
            password: ""
          }
        },
        true
      )
      .then(res => {
        return expect((res as Response).ok).is.true;
      });
  });
});

describe("Shop client integration PATCH tests", () => {
  it("Throws error calling PATCH with no token", () => {
    const newLocalClient = new Shop.ShopApi({
      baseUri: BASE_URI
    });

    return expect(
      newLocalClient.updateCustomerProductListItem({
        parameters: {
          itemId: "item_id"
        },
        body: {}
      })
    ).to.be.rejected;
  });

  it("Returns object calling PATCH with required template parameter", () => {
    return expect(
      client.updateCustomerProductListItem({
        parameters: {
          itemId: "item_id"
        },
        body: {}
      })
    ).to.eventually.deep.equal({});
  });
});

describe("Shop client integration DELETE tests", () => {
  it("Throws error calling DELETE with no token", () => {
    const newLocalClient = new Shop.ShopApi({
      baseUri: BASE_URI
    });

    return expect(newLocalClient.deleteSite()).to.be.rejected;
  });

  it("Returns object calling DELETE with valid token", () => {
    return client
      .deleteSite({}, true)
      .then(res => expect((res as Response).ok).to.be.true);
  });
});

describe("Shop client integration POST tests", () => {
  it("Throws error calling POST with no token", () => {
    const newLocalClient = new Shop.ShopApi({
      baseUri: BASE_URI
    });

    return expect(
      newLocalClient.searchProducts({
        body: {
          count: 1,
          // eslint-disable-next-line @typescript-eslint/camelcase
          db_start_record_: 0,
          expand: [""],
          query: {},
          select: "",
          // eslint-disable-next-line @typescript-eslint/camelcase
          sorts: [{ field: "", sort_order: "0" }],
          start: 0
        }
      })
    ).to.be.rejected;
  });

  it("Throws error calling POST with valid out valid enum", () => {
    return expect(
      client.searchProducts({
        body: {
          count: 1,
          // eslint-disable-next-line @typescript-eslint/camelcase
          db_start_record_: 0,
          expand: [""],
          query: {},
          select: "",
          // eslint-disable-next-line @typescript-eslint/camelcase
          sorts: [{ field: "", sort_order: "0" }],
          start: 0
        }
      })
    ).to.be.rejected;
  });

  it("Returns object calling POST with valid token and valid request body", () => {
    return expect(
      client.searchProducts({
        body: {
          count: 1,
          // eslint-disable-next-line @typescript-eslint/camelcase
          db_start_record_: 0,
          expand: [""],
          query: {},
          select: "",
          // eslint-disable-next-line @typescript-eslint/camelcase
          sorts: [{ field: "", sort_order: "asc" }],
          start: 0
        }
      })
    ).to.eventually.deep.equal({});
  });
});

describe("Test that function parameters have data types", () => {
  it("Test that function parameters have data types", () => {
    type funcParam = Parameters<
      typeof Shop.ShopApi.prototype.searchProducts
    >[0];
    type siteIdType = funcParam["parameters"]["siteId"];
    let temp: siteIdType;
    //verify that siteId is of type string
    assert<IsExact<typeof temp, string>>(true);
  });
});
