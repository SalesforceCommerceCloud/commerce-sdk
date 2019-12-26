/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { getBearer } from "../src";
import { expect, default as chai } from "chai";
import chaiAsPromised from "chai-as-promised";
import nock from "nock";
import _ from "lodash";

before(() => {
  chai.use(chaiAsPromised);
});

describe("Test Auth", () => {
  afterEach(nock.cleanAll);
  // afterEach(fetchMock.restore);
  it("Test getting token", () => {
    nock("https://anypoint.mulesoft.com")
      .post("/accounts/login", { username: "user", password: "pass" })
      .reply(200, {
        // eslint-disable-next-line @typescript-eslint/camelcase
        access_token: "AUTH_TOKEN_HERE"
      });
    return getBearer("user", "pass").then(s => {
      expect(s).to.equals("AUTH_TOKEN_HERE");
    });
  });

  it("Test failed auth bad user/password", () => {
    nock("https://anypoint.mulesoft.com")
      .post("/accounts/login", { username: "user", password: "pass" })
      .reply(401, "Unauthorized");

    return expect(getBearer("user", "pass")).to.be.rejectedWith(
      "Invalid username/password"
    );
  });

  it("Test failed auth unknown error", () => {
    nock("https://anypoint.mulesoft.com")
      .post("/accounts/login", { username: "user", password: "pass" })
      .reply(500, "Unknown Error");

    return expect(getBearer("user", "pass")).to.be.rejectedWith(
      "Unknown Error 500: Internal Server Error"
    );
  });
});
