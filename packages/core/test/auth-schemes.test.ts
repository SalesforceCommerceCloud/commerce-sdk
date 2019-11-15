import { BaseClient } from "../src/base/client";
import { AccountManager } from "../src/base/auth-schemes";

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
        expect(res.headers["Authentication"]).to.be.equal(
          "Bearer ACCESS_TOKEN"
        );
      });
    });
  });

  it("Test inject auth, don't override", () => {
    getTokenStub.resolves(ACCESS_TOKEN);
    return am.authenticate().then(() => {
      return am
        .injectAuth({
          headers: {
            Authentication: "A CUSTOM HEADER"
          }
        })
        .then(res => {
          expect(res.headers["Authentication"]).to.be.equal("A CUSTOM HEADER");
        });
    });
  });

  it("Inject auth returns options when client is mocked", () => {
    am.injectAuth({
      headers: {
        "ms2-authorization": "bearer mock token"
      }
    }).then(res => {
      expect(res.headers["ms2-authorization"]).to.be.equal("bearer mock token");
      expect(getTokenStub.called).to.be.false;
    });
  });
});
