/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect, default as chai } from "chai";
import chaiAsPromised from "chai-as-promised";

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

import tmp from "tmp";
const FILE_LIST = [
  {
    files: [
      {
        externalLink: "https://mulesoft/raml.zip",
        classifier: "raml",
        packaging: "zip",
        __typename: "AssetFile"
      },
      {
        externalLink: "https://mulesoft/fatraml.zip",
        classifier: "fat-raml",
        packaging: "zip",
        __typename: "AssetFile"
      },
      {
        externalLink: "https://mulesoft/oas.zip",
        classifier: "oas",
        packaging: "zip",
        __typename: "AssetFile"
      }
    ],
    type: "rest-api",
    __typename: "Asset"
  }
];

describe("Test Downloads", () => {
  afterEach(fetchMock.restore);

  it("can download", () => {
    const tmpDir = tmp.dirSync();
    fetchMock.get("https://mulesoft/fatraml.zip", 200);
    return downloadAssets(FILE_LIST, tmpDir.name).then(s => {
      expect(s[0]).to.be.undefined;
    });
  });
});
