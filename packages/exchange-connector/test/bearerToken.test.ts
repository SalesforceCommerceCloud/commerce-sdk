/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { getBearer } from "../src";
import { expect, default as chai } from "chai";
import chaiAsPromised from "chai-as-promised";
import { processRamlFile } from "../../generator/src/parser";

before(() => {
  chai.use(chaiAsPromised);
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodeFetch = require("node-fetch");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let fetchMock: any;

// Hey!! This is already a sandbox so lets just used the sandbox!!!!!
// (jest solves this by doing `jest.requireActual('node-fetch');`)
if (typeof nodeFetch.default.getNativeFetch === "function") {
  fetchMock = nodeFetch.default;
} else {
  fetchMock = require("fetch-mock").sandbox();
  nodeFetch.default = fetchMock;
}

describe("Test Auth", () => {
  afterEach(fetchMock.restore);

  it("Test getting token", () => {
    fetchMock.post("*", {
      status: 200,
      body: {
        // eslint-disable-next-line @typescript-eslint/camelcase
        access_token: "AUTH_TOKEN_HERE"
      }
    });
    return getBearer("user", "pass").then(s => {
      expect(s).to.equals("AUTH_TOKEN_HERE");
    });
  });

  it("Test failed auth bad user/password", () => {
    fetchMock.post("*", {
      status: 401,
      body: "Unauthorized"
    });
    expect(getBearer("user", "badpass")).to.be.eventually.rejectedWith(
      new Error("Invalid username/password")
    );
  });

  it("Test failed auth unknown error", () => {
    fetchMock.post("*", {
      status: 500,
      body: "Unknown Error"
    });
    expect(getBearer("user", "badpass")).to.be.eventually.rejectedWith(
      new Error("Unknown Error 500: Internal Server Error")
    );
  });
});
