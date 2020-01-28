/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { BaseClient, ResponseError } from "../src/base/client";
import {
  ShopperJWT,
  ShopperJWTConfig,
  AuthRequestType
} from "../src/base/auth-shopper-jwt";

import { expect, default as chai } from "chai";
import chaiAsPromised from "chai-as-promised";

import _ from "lodash";
import nock from "nock";

before(() => {
  chai.should();
  chai.use(chaiAsPromised);
});

describe("Test init", () => {
  it("correctly initializes auth client from client and shopperJWTConfig", () => {
    const c = new BaseClient({ authHost: "auth-host", clientId: "client-id" });
    const shopperJWTConfig = new ShopperJWTConfig(
      "jamesbond",
      "007007007",
      AuthRequestType.Credentials
    );
    const sj = new ShopperJWT();

    sj.init(c, shopperJWTConfig);

    expect(sj.authClient.clientConfig.baseUri).to.equal(
      c.clientConfig.authHost
    );
    expect(sj.authClient.clientConfig.headers["x-dw-client-id"]).to.equal(
      c.clientConfig.clientId
    );
    expect(sj.authRequestType).to.equal(AuthRequestType.Credentials);
  });

  it("correctly initializes auth client from client if shopperJWTConfig is not provided", () => {
    const c = new BaseClient({ authHost: "auth-host", clientId: "client-id" });
    const sj = new ShopperJWT();

    sj.init(c);

    expect(sj.authClient.clientConfig.baseUri).to.equal(
      c.clientConfig.authHost
    );
    expect(sj.authClient.clientConfig.headers["x-dw-client-id"]).to.equal(
      c.clientConfig.clientId
    );
    // Make sure it defaults to `guest` if no ShopperJWTConfig is provided
    expect(sj.authRequestType).to.equal(AuthRequestType.Guest);
  });

  it("defaults to `guest` if shopperJWTConfig.AuthRequestType is not provided", () => {
    const c = new BaseClient({ authHost: "auth-host", clientId: "client-id" });
    const sj = new ShopperJWT();
    const shopperJWTConfig = new ShopperJWTConfig("jamesbond", "007007007");

    sj.init(c, shopperJWTConfig);

    expect(sj.authRequestType).to.equal(AuthRequestType.Guest);
  });

  it("adds a STS header for AuthRequestType.Credentials", () => {
    const c = new BaseClient({ authHost: "auth-host", clientId: "client-id" });
    const sj = new ShopperJWT();
    const shopperJWTConfig = new ShopperJWTConfig(
      "jamesbond",
      "007007007",
      AuthRequestType.Credentials
    );

    sj.init(c, shopperJWTConfig);

    expect(
      sj.authClient.clientConfig.headers["Strict-Transport-Security"]
    ).to.equal("max-age=31536000; includeSubDomains");
  });
});

describe("Test authenticate", () => {
  it("returns false for authenticate", () => {
    const sj = new ShopperJWT();

    expect(sj.authenticate()).to.eventually.be.false;
  });
});

const tokenExpired = {
  authHeaderString:
    "Bearer eyJfdiI6IjEiLCJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfdiI6IjEiLCJleHAiOjE1NzkxMDYyMTMsImlhdCI6MTU3OTEwNDQxMywiaXNzIjoiZjY2ZjBlNGYtZmE0NC00MWViLTliMzUtODlkZTllZTY3ZTcxIiwic3ViIjoie1wiX3ZcIjpcIjFcIixcImN1c3RvbWVyX2luZm9cIjp7XCJjdXN0b21lcl9pZFwiOlwiYWJ2YUo3YzZKNW4wZE04c292aXdRTE1WZDhcIixcImd1ZXN0XCI6dHJ1ZX19In0.dl8XgldAVo8SGRDrrSAdnbD_tnRnfYwIrohjhsPW78JgTif2kukQqnB74RgKHRx6U5CTBee8ktTVwqnmtguRT5rQhBTTMT9xn9kmeQ4VITqBlG6DszzTwhHgZ5VT5ESlyiCdI-5WKs5BousEoNdMIhbXaKSnJCcdLdvbxTuppzLF0fW-yzpLi4caFUidewTrFoFBUj7M4UpF2gd0DtJhX2YEJCTn5jA4y-ue4oY7Vcp6Y2NpG_mOX_gOmYm_m7hJzKuY4zU90SGc-GYkbBKfRPK3GthTr0LNXVsknydirpsZDI1hlBjrCxNz689-ogulUKDyNbowhHcp1LU9BXRLt_EKqVZXCunx8Ewq5j_FTe8tj8EdAz-1Y081G1Zatz9P3-RoGsk4N6kLozoGuuA2m975px3Ag-Rp5X_PLnAQcEVmCA19WZRQ4zhWY7IkMj5IyX-qRkCeYSvjv-6Q8_csOaK5vymmdhNG7o018FKv1lkKGYxyvTWVsyYrfOqDhTrd",
  decoded: {
    _v: "1",
    exp: 1579106213,
    iat: 1579104413,
    iss: "f66f0e4f-fa44-41eb-9b35-89de9ee67e71",
    sub:
      '{"_v":"1","customer_info":{"customer_id":"abvaJ7c6J5n0dM8soviwQLMVd8","guest":true}}'
  }
};

const tokenLongValid = {
  authHeaderString:
    "Bearer eyJfdiI6IjEiLCJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfdiI6IjEiLCJleHAiOjI1NzkwMzAzMDgsImlhdCI6MTA3OTAyODUwOCwiaXNzIjoiZjY2ZjBlNGYtZmE0NC00MWViLTliMzUtODlkZTllZTY3ZTcxIiwic3ViIjoie1wiX3ZcIjpcIjFcIixcImN1c3RvbWVyX2luZm9cIjp7XCJjdXN0b21lcl9pZFwiOlwiYWJTT0lQWEMyRlJpQU1Kc0hIQXdhTXpXeDRcIixcImd1ZXN0XCI6dHJ1ZX19In0.sYUKUAuxZOag4PPLw3FGUMI63-xzTt5b11PS7old4Lc",
  decoded: {
    _v: "1",
    exp: 2579030308,
    iat: 1079028508,
    iss: "f66f0e4f-fa44-41eb-9b35-89de9ee67e71",
    sub:
      '{"_v":"1","customer_info":{"customer_id":"abSOIPXC2FRiAMJsHHAwaMzWx4","guest":true}}'
  }
};

describe("Test refresh", () => {
  afterEach(nock.cleanAll);

  it("gets first token successfully", async () => {
    const scope = nock("https://somewhere")
      .defaultReplyHeaders({ authorization: tokenLongValid.authHeaderString })
      .post("/")
      .reply(200);
    const sj = new ShopperJWT();

    sj.init(new BaseClient({ authHost: "https://somewhere" }));
    await sj.refresh();

    expect(sj.token).to.deep.equal(tokenLongValid);
  });

  it("fails to get first token", async () => {
    const scope = nock("https://somewhere")
      .post("/")
      .reply(401);
    const sj = new ShopperJWT();

    sj.init(new BaseClient({ authHost: "https://somewhere" }));

    return sj.refresh().should.eventually.be.rejectedWith(ResponseError);
  });

  it("gets new token successfully when token is expired", async () => {
    const scope = nock("https://somewhere")
      .defaultReplyHeaders({ authorization: tokenLongValid.authHeaderString })
      .post("/")
      .reply(200);
    const sj = new ShopperJWT();

    sj.init(new BaseClient({ authHost: "https://somewhere" }));
    sj.token = tokenExpired;
    await sj.refresh();

    expect(sj.token).to.deep.equal(tokenLongValid);
  });

  it("fails to get new token when token is expired", async () => {
    const scope = nock("https://somewhere")
      .post("/")
      .reply(401);
    const sj = new ShopperJWT();

    sj.init(new BaseClient({ authHost: "https://somewhere" }));
    sj.token = tokenExpired;

    return sj.refresh().should.eventually.be.rejectedWith(ResponseError);
  });

  it("does not get new token when token is still valid", async () => {
    const scope = nock("https://somewhere")
      .defaultReplyHeaders({ authorization: tokenExpired.authHeaderString })
      .post("/")
      .reply(200);
    const sj = new ShopperJWT();

    sj.init(new BaseClient({ authHost: "https://somewhere" }));
    sj.token = tokenLongValid;
    await sj.refresh();

    expect(sj.token).to.deep.equal(tokenLongValid);
  });
});

describe("Test injectAuth", async () => {
  it("injects token into headers", async () => {
    const scope = nock("https://somewhere")
      .defaultReplyHeaders({ authorization: tokenLongValid.authHeaderString })
      .post("/")
      .reply(200);
    const sj = new ShopperJWT();

    sj.init(new BaseClient({ authHost: "https://somewhere" }));
    const headers = await sj.injectAuth({});

    expect(headers["Authorization"]).to.equal(tokenLongValid.authHeaderString);
  });

  it("does not call refresh or inject token into headers if an Authorization header is passed", async () => {
    const scope = nock("https://somewhere")
      .defaultReplyHeaders({ authorization: tokenExpired.authHeaderString })
      .post("/")
      .reply(200);
    const sj = new ShopperJWT();

    sj.init(
      new BaseClient({
        authHost: "https://somewhere",
        headers: { Authorization: tokenLongValid.authHeaderString }
      })
    );
    const headers = await sj.injectAuth({});

    expect(nock.isDone()).to.be.true;
    expect(headers["Authorization"]).to.not.equal(
      tokenLongValid.authHeaderString
    );
  });
});

describe("Test ShopperJWTConfig.toAuthHeader", async() => {
  it("returns Authorization header with Basic Auth for AuthRequestType.Credentials", () => {
    const shopperJWTConfig = new ShopperJWTConfig(
      "jamesbond",
      "007007007",
      AuthRequestType.Credentials
    );
    const base64EncodedCreds = Buffer.from(
      `${shopperJWTConfig.username}:${shopperJWTConfig.password}`
    ).toString("base64");
    const basicToken = `Basic ${base64EncodedCreds}`;

    expect(shopperJWTConfig.toAuthHeader()["Authorization"]).to.equal(
      basicToken
    );
  });

  it("does not return an Authorization header for AuthRequestType.Guest", () => {
    const shopperJWTConfig = new ShopperJWTConfig(
      "jamesbond",
      "007007007",
      AuthRequestType.Guest
    );

    expect(shopperJWTConfig.toAuthHeader()["Authorization"]).to.be.undefined;
  });
});
