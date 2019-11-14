"use strict";

import * as authMock from "@commerce-sdk/exchange-connector";
const fetchMock = require("fetch-mock").sandbox();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodeFetch = require("node-fetch");
nodeFetch.default = fetchMock;
import sinon from "sinon";

import { expect } from "chai";

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

  it("YES useMock client config does not get bearer token", () => {
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

  it("YES useMock and wrong password, throws some api error", () => {
    const client = new BaseClient({ baseUri: "https://somewhere" });
    expect(client.initializeMockService()).to.eventually.rejectedWith(error);
  });
});
