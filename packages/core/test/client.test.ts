/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";

import * as authMock from "@commerce-apps/raml-toolkit";

import sinon from "sinon";

import chai from "chai";
import chaiAsPromised from "chai-as-promised";

const expect = chai.expect;

before(() => {
  chai.should();
  chai.use(chaiAsPromised);
});

import { BaseClient } from "../src/base/client";

describe("base client config get Bearer token success tests", () => {
  let sandbox;
  let getBearerMock;

  before(() => {
    sandbox = sinon.createSandbox();
    getBearerMock = sandbox.stub(authMock, "getBearer").resolves("success");
  });

  after(() => {
    sandbox.restore();
  });

  it("empty client config does not get bearer token", () => {
    new BaseClient({});
    expect(getBearerMock.calledOnce).to.be.false;
  });

  it("baseUri only client config does not get bearer token", () => {
    new BaseClient({ baseUri: "https://somewhere" });
    expect(getBearerMock.calledOnce).to.be.false;
  });

  it("useMock client config does not get bearer token", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });
    return client.initializeMockService().then(() => {
      expect(getBearerMock.calledOnce).to.be.true;
    });
  });
});

describe("base client config get Bearer token failure tests", () => {
  let sandbox;
  let error;

  before(() => {
    error = new Error("some api error");
    sandbox = sinon.createSandbox();
    sandbox.stub(authMock, "getBearer").rejects(error);
  });

  after(() => {
    sandbox.restore();
  });

  it("useMock and wrong password, throws some api error", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });
    return client
      .initializeMockService()
      .should.eventually.be.rejectedWith(Error);
  });
});
