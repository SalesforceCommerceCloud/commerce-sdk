import { BaseClient, ClientConfig, Response, ResponseError } from "../src";

import { IAuthScheme, AccountManager, AuthSchemes } from "../src";

import { StaticClient } from "../src";

import chai from "chai";
const expect = chai.expect;

describe("test exports", () => {
  it("can import BaseClient", () => expect(BaseClient).to.exist);

  it("can import Response", () => expect(Response).to.exist);

  it("can import ResponseError", () => expect(ResponseError).to.exist);

  it("can import StaticClient.get", () => expect(StaticClient.get).to.exist);

  it("can import StaticClient.delete", () =>
    expect(StaticClient.delete).to.exist);

  it("can import StaticClient.patch", () =>
    expect(StaticClient.patch).to.exist);

  it("can import StaticClient.post", () => expect(StaticClient.post).to.exist);

  it("can import StaticClient.put", () => expect(StaticClient.put).to.exist);
});
