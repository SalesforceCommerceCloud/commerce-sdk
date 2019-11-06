import { getBearer } from "../src";
import { assert } from "chai";

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

  it("Test getting token", async () => {
    fetchMock.post("*", {
      status: 200,
      body: {
        // eslint-disable-next-line @typescript-eslint/camelcase
        access_token: "AUTH_TOKEN_HERE"
      }
    });
    const token = await getBearer("user", "pass");
    assert.equal(token, "AUTH_TOKEN_HERE");
  });

  it("Test failed auth", async () => {
    fetchMock.post("*", {
      status: 401,
      body: "Unauthorized"
    });

    return getBearer("user", "badpass")
      .then(res => {
        assert.isDefined(
          res,
          "We should not be here! Because we should have failed"
        );
      })
      .catch(res => {
        assert.equal(res.message, "Invalid username/password");
      });
  });

  it("Test failed auth", async () => {
    fetchMock.post("*", {
      status: 500,
      body: "Unknown Error"
    });

    return getBearer("user", "badpass")
      .then(res => {
        assert.isDefined(
          res,
          "We should not be here! Because we should have failed"
        );
      })
      .catch(res => {
        assert.equal(res.message, "Unknown Error 500: Internal Server Error");
      });
  });
});
