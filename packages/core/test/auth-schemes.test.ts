/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { BaseClient } from "../src/base/client";
import { AccountManager, ShopperJWT } from "../src/base/auth-schemes";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ShopperAuthClient = require("../src/base/static-client");

import { expect, default as chai } from "chai";
import chaiAsPromised from "chai-as-promised";

import _ from "lodash";
import sinon from "sinon";

before(() => {
  chai.use(chaiAsPromised);
});

const ACCESS_TOKEN = {
  // eslint-disable-next-line @typescript-eslint/camelcase
  access_token: "ACCESS_TOKEN",
  scope: "mail",
  // eslint-disable-next-line @typescript-eslint/camelcase
  token_type: "Bearer",
  // eslint-disable-next-line @typescript-eslint/camelcase
  expires_in: 1798
};

const SHOPPER_TOKEN = {
  // eslint-disable-next-line @typescript-eslint/camelcase
  headers: {
    get: () => "Bearer abcd"
  }
};

describe("Test account manager auth", () => {
  let client: BaseClient;
  let am: AccountManager;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let getTokenStub: any;

  beforeEach(() => {
    client = new BaseClient({
      clientId: "ID",
      clientSecret: "SECRET",
      authHost: "https://somewhere.com"
    });

    am = new AccountManager();

    am.init(client);

    getTokenStub = sinon.stub(am.oauth2.clientCredentials, "getToken");
  });

  it("Test getting access token", () => {
    getTokenStub.resolves(ACCESS_TOKEN);

    return am.authenticate().then(res => {
      expect(res).to.be.true;
      expect(am.token.token["access_token"]).to.be.equal(
        ACCESS_TOKEN["access_token"]
      );
    });
  });

  it("Test getting failing token", () => {
    getTokenStub.rejects("Response Error: 401 Unauthorized");

    return am.authenticate().then(res => {
      expect(res).to.be.false;
      expect(am.token).to.be.not.ok;
    });
  });

  it("Test init", () => {
    const am = new AccountManager();
    am.init(client);
    expect(am.oauth2).to.be.ok;
  });

  it("Test refresh", () => {
    getTokenStub.resolves(ACCESS_TOKEN);
    return am.authenticate().then(() => {
      const tokenCopy = _.cloneDeep(am.token);
      const refresh = sinon.fake.resolves(tokenCopy);
      sinon.replace(am.token, "refresh", refresh);
      sinon.replace(am.token, "expired", () => true);
      expect(am.token.expired()).to.be.true;

      return am.refresh().then(() => {
        return expect(am.token.expired()).to.be.false;
      });
    });
  });

  it("Test refresh when not needed", () => {
    getTokenStub.resolves(ACCESS_TOKEN);

    return am.authenticate().then(() => {
      const noRefresh = sinon.fake.throws(
        new Error("We shouldn't be trying this")
      );
      sinon.replace(am.token, "refresh", noRefresh);
      expect(am.token.expired()).to.be.false;

      return am.refresh().then(() => {
        return expect(am.token.expired()).to.be.false;
      });
    });
  });

  it("Test refresh with failure", () => {
    getTokenStub.resolves(ACCESS_TOKEN);

    return am.authenticate().then(() => {
      const error = new Error("401 Error here");
      const noRefresh = sinon.fake.throws(error);
      sinon.replace(am.token, "refresh", noRefresh);
      sinon.replace(am.token, "expired", () => true);
      expect(am.token.expired()).to.be.true;
      return expect(am.refresh()).to.be.eventually.rejectedWith(error);
    });
  });

  it("Test inject auth", () => {
    getTokenStub.resolves(ACCESS_TOKEN);
    return am.authenticate().then(() => {
      return am.injectAuth({}).then(res => {
        expect(res["Authentication"]).to.be.equal("Bearer ACCESS_TOKEN");
      });
    });
  });

  it("Test inject auth, don't override", () => {
    getTokenStub.resolves(ACCESS_TOKEN);
    return am.authenticate().then(() => {
      return am
        .injectAuth({
          Authentication: "A CUSTOM HEADER"
        })
        .then(res => {
          expect(res["Authentication"]).to.be.equal("A CUSTOM HEADER");
        });
    });
  });
});

describe("Test shopper jwt successfully resolving token", () => {
  let client: BaseClient;
  let shopperJwt: ShopperJWT;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let getTokenStub: any;

  beforeEach(() => {
    client = new BaseClient({
      clientId: "ID",
      clientSecret: "SECRET",
      authHost: "https://somewhere.com"
    });
    shopperJwt = new ShopperJWT();
    shopperJwt.init(client);
    getTokenStub = sinon.stub(ShopperAuthClient, "_post");
    getTokenStub.resolves(SHOPPER_TOKEN);
  });

  afterEach(() => {
    getTokenStub.restore();
  });

  it("get authorization token resolves successfully", () => {
    return shopperJwt.authenticate().then(res => {
      expect(res).to.be.true;
      expect(shopperJwt.token).to.be.equal("abcd");
    });
  });

  it("Test init", () => {
    const am = new ShopperJWT();
    am.init(client);
    expect(am.token).to.be.not.ok;
  });

  it("Test refresh", () => {
    const shopperJWTRefreshing = new ShopperJWT();
    shopperJWTRefreshing.init(client);
    // Initial token is empty
    expect(shopperJWTRefreshing.token).to.be.not.ok;
    // Expect refresh to get the token as well
    return shopperJWTRefreshing.refresh().then(() => {
      expect(shopperJWTRefreshing.token).to.be.ok;
    });
  });

  it("Test inject auth", () => {
    return shopperJwt.authenticate().then(() => {
      return shopperJwt.injectAuth({}).then(res => {
        expect(res["Authentication"]).to.be.equal("Bearer abcd");
      });
    });
  });

  it("Test inject auth, don't override", () => {
    return shopperJwt.authenticate().then(() => {
      return shopperJwt
        .injectAuth({
          Authentication: "A CUSTOM HEADER"
        })
        .then(res => {
          expect(res["Authentication"]).to.be.equal("A CUSTOM HEADER");
        });
    });
  });
});

describe("Test shopper jwt auth rejects tokens", () => {
  let client: BaseClient;
  let am: ShopperJWT;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let getTokenStub: any;

  beforeEach(() => {
    client = new BaseClient({
      clientId: "ID",
      clientSecret: "SECRET",
      authHost: "https://somewhere.com"
    });
    am = new ShopperJWT();
    am.init(client);
    getTokenStub = sinon.stub(ShopperAuthClient, "_post");
    getTokenStub.rejects("Response Error: 401 Unauthorized");
  });

  afterEach(() => {
    getTokenStub.restore();
  });

  it("Test getting failing token", () => {
    return am.authenticate().then(res => {
      expect(res).to.be.false;
      expect(am.token).to.be.not.ok;
    });
  });

  it("Test refresh with failing token", () => {
    const sjwt = new ShopperJWT();
    sjwt.init(client);
    // Initial token is empty
    expect(sjwt.token).to.be.not.ok;
    // Expect refresh to get the token as well
    return sjwt.refresh().then(() => {
      expect(sjwt.token).to.be.not.ok;
    });
  });

  it("Test inject auth with failing token, don't override", () => {
    return am.authenticate(client).then(() => {
      return am
        .injectAuth({
          Authentication: "A CUSTOM HEADER"
        })
        .then(res => {
          expect(res["Authentication"]).to.be.equal("A CUSTOM HEADER");
        });
    });
  });
});
