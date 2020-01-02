/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {
  downloadRestApi,
  downloadRestApis,
  searchExchange
} from "../src/exchangeDownloader";
import { RestApi } from "../src/exchangeTypes";
import { searchAssetApiResultObject } from "./resources/restApiResponseObjects";

import { expect, default as chai } from "chai";
import chaiAsPromised from "chai-as-promised";
import nock from "nock";
import _ from "lodash";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assetSearchResults = require("./resources/assetSearch.json");

before(() => {
  chai.should();
  chai.use(chaiAsPromised);
});

import tmp from "tmp";
import { Response } from "node-fetch";

const REST_API: RestApi = {
  name: "Test API",
  groupId: "8888888",
  assetId: "test-api",
  fatRaml: {
    classifier: "rest-api",
    sha1: "sha1",
    md5: "md5",
    externalLink: "https://somewhere/fatraml.zip",
    packaging: "zip",
    createdDate: "today",
    mainFile: "api.raml"
  },
  version: "v1"
};

describe("Test downloadRestApi", () => {
  afterEach(nock.cleanAll);

  it("can download single file", async () => {
    const tmpDir = tmp.dirSync();

    nock("https://somewhere")
      .get("/fatraml.zip")
      .reply(200);

    const api = _.cloneDeep(REST_API);

    return downloadRestApi(api, tmpDir.name).then((res: Response) => {
      expect(res.status).to.be.equal(200);
    });
  });

  it("can download single file, no download dir specified", async () => {
    nock("https://somewhere")
      .get("/fatraml.zip")
      .reply(200);

    const api = _.cloneDeep(REST_API);

    return downloadRestApi(api).then((res: Response) => {
      expect(res.status).to.be.equal(200);
    });
  });

  it("throws if no fat raml", async () => {
    const tmpDir = tmp.dirSync();

    nock("https://somewhere")
      .get("/fatraml.zip")
      .reply(200);

    const api = _.cloneDeep(REST_API);

    delete api.fatRaml;

    return expect(downloadRestApi(api, tmpDir.name)).to.be.rejectedWith(
      "Fat RAML download information for test-api is missing"
    );
  });
});

describe("Test downloadRestApis", () => {
  afterEach(nock.cleanAll);

  it("can download multiple files", async () => {
    const tmpDir = tmp.dirSync();

    const apis = [_.cloneDeep(REST_API), _.cloneDeep(REST_API)];

    apis[1].fatRaml.externalLink = "https://somewhere/fatraml2.zip";

    const scope = nock("https://somewhere");

    scope.get("/fatraml.zip").reply(200);
    scope.get("/fatraml2.zip").reply(200);

    return downloadRestApis(apis, tmpDir.name).then(res => {
      expect(res).to.be.equal(tmpDir.name);
    });
  });

  it("can download multiple files with no specified dir", async () => {
    const apis = [_.cloneDeep(REST_API), _.cloneDeep(REST_API)];

    apis[1].fatRaml.externalLink = "https://somewhere/fatraml2.zip";

    const scope = nock("https://somewhere");

    scope.get("/fatraml.zip").reply(200);
    scope.get("/fatraml2.zip").reply(200);

    return downloadRestApis(apis).then(res => {
      expect(res).to.be.equal("download");
    });
  });

  it("does nothing on empty list", async () => {
    const apis = [];

    return downloadRestApis(apis).then(res => {
      expect(res).to.be.equal("download");
    });
  });
});

describe("Test searchExchange", () => {
  afterEach(nock.cleanAll);

  it("can download multiple files", async () => {
    const scope = nock("https://anypoint.mulesoft.com/exchange/api/v2");

    scope
      .get("/assets?search=searchString")
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      .reply(200, assetSearchResults);

    return searchExchange("AUTH_TOKEN", "searchString").then(res => {
      expect(res).to.be.deep.equal(searchAssetApiResultObject);
    });
  });
});
