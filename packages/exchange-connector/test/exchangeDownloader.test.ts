/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {
  downloadRestApi,
  downloadRestApis,
  searchExchange,
  getAsset,
  getVersionByDeployment,
  getSpecificApi
} from "../src";
import { RestApi } from "../src/exchangeTypes";
import { searchAssetApiResultObject } from "./resources/restApiResponseObjects";
import * as exchangeDownloader from "../src/exchangeDownloader";

import { expect, default as chai } from "chai";
import chaiAsPromised from "chai-as-promised";
import nock from "nock";
import _ from "lodash";
import sinon from "sinon";
import tmp from "tmp";
import { Response } from "node-fetch";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assetSearchResults = require("./resources/assetSearch.json");

// eslint-disable-next-line @typescript-eslint/no-var-requires
const getAssetWithVersion = require("./resources/getAssetWithVersion");

// eslint-disable-next-line @typescript-eslint/no-var-requires
const getAssetWithoutVersion = require("./resources/getAsset");

before(() => {
  chai.should();
  chai.use(chaiAsPromised);
});

const REST_API: RestApi = {
  id: "8888888/test-api/1.0.0",
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
  version: "1.0.0"
};

describe("downloadRestApi", () => {
  afterEach(nock.cleanAll);

  it("can download a single file", async () => {
    const tmpDir = tmp.dirSync();

    nock("https://somewhere")
      .get("/fatraml.zip")
      .reply(200);

    const api = _.cloneDeep(REST_API);

    return downloadRestApi(api, tmpDir.name).then((res: Response) => {
      expect(res.status).to.equal(200);
    });
  });

  it("can download a single file even when no download dir is specified", async () => {
    nock("https://somewhere")
      .get("/fatraml.zip")
      .reply(200);

    const api = _.cloneDeep(REST_API);

    return downloadRestApi(api).then((res: Response) => {
      expect(res.status).to.equal(200);
    });
  });

  it("doesn't return anything if fat raml information is missing", async () => {
    const api = _.cloneDeep(REST_API);
    delete api.fatRaml.createdDate;

    return expect(downloadRestApi(api)).to.eventually.be.undefined;
  });
});

describe("downloadRestApis", () => {
  beforeEach(sinon.restore);

  it("can download multiple files", async () => {
    const downloadRestApiStub = sinon
      .stub(exchangeDownloader, "downloadRestApi")
      .resolves(new Response("/fatraml.zip"));
    const dest = "destinationDir";

    const apis = [_.cloneDeep(REST_API), _.cloneDeep(REST_API)];
    apis[1].fatRaml.externalLink = "https://somewhere/fatraml2.zip";

    return downloadRestApis(apis, dest).then(res => {
      expect(downloadRestApiStub.calledTwice).to.be.true;
      expect(res).to.equal(dest);
    });
  });

  it("can download multiple files even when no destination folder is provided", async () => {
    const downloadRestApiStub = sinon
      .stub(exchangeDownloader, "downloadRestApi")
      .resolves(new Response("/fatraml.zip"));

    const apis = [_.cloneDeep(REST_API), _.cloneDeep(REST_API)];
    apis[1].fatRaml.externalLink = "https://somewhere/fatraml2.zip";

    return downloadRestApis(apis).then(res => {
      expect(downloadRestApiStub.calledTwice).to.be.true;
      expect(res).to.equal("download");
    });
  });

  it("does nothing when an empty list is passed", async () => {
    const downloadRestApiStub = sinon.stub(
      exchangeDownloader,
      "downloadRestApi"
    );

    return downloadRestApis([]).then(res => {
      expect(downloadRestApiStub.called).to.be.false;
      expect(res).to.equal("download");
    });
  });
});

describe("searchExchange", () => {
  afterEach(nock.cleanAll);

  it("can download multiple files", async () => {
    const scope = nock("https://anypoint.mulesoft.com/exchange/api/v2");

    scope.get("/assets?search=searchString").reply(200, assetSearchResults);

    return searchExchange("AUTH_TOKEN", "searchString").then(res => {
      expect(res).to.deep.equal(searchAssetApiResultObject);
    });
  });
});

describe("getSpecificApi", () => {
  beforeEach(sinon.restore);

  it("should return the response in RestApi type", async () => {
    const getAssetStub = sinon
      .stub(exchangeDownloader, "getAsset")
      .resolves(getAssetWithVersion);

    const restApi = getSpecificApi(
      "AUTH_TOKEN",
      "893f605e-10e2-423a-bdb4-f952f56eb6d8",
      "shopper-customers",
      "0.0.1"
    );

    expect(getAssetStub.called).to.be.true;
    return expect(restApi).to.eventually.deep.equal({
      id: "893f605e-10e2-423a-bdb4-f952f56eb6d8/shopper-customers/0.0.1",
      name: "Shopper Customers",
      description:
        "Let customers log in and manage their profiles and product lists.",
      updatedDate: "2020-02-06T17:55:32.375Z",
      groupId: "893f605e-10e2-423a-bdb4-f952f56eb6d8",
      assetId: "shopper-customers",
      version: "0.0.1",
      categories: {
        "API layer": ["Process"],
        "CC API Visibility": ["External"],
        "CC Version Status": ["Beta"],
        "CC API Family": ["Customer"]
      },
      fatRaml: {
        classifier: "fat-raml",
        packaging: "zip",
        externalLink:
          "https://exchange2-asset-manager-kprod.s3.amazonaws.com/893f605e-10e2-423a-bdb4-f952f56eb6d8/bfff7ae2c59dd68e81adee900b56f8fd0d8ab00bc42206d0af3e96fa1025e9c3.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAJTBQMSKYL2HXJA4A%2F20200206%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20200206T191341Z&X-Amz-Expires=86400&X-Amz-Signature=32c30dbb73e3031ef95da76382e52acb14ad734535e108864a506a34f8e21f3f&X-Amz-SignedHeaders=host&response-content-disposition=attachment%3B%20filename%3Dshopper-customers-0.0.1-raml.zip",
        createdDate: "2020-01-22T03:25:00.200Z",
        md5: "3ce41ea699c8be4446909f172cfac317",
        sha1: "10331d32527f78bf76e0b48ab2d05945d8d141c1",
        mainFile: "shopper-customers.raml"
      }
    });
  });

  it("should return null if version is not provided", async () => {
    const getAssetStub = sinon
      .stub(exchangeDownloader, "getAsset")
      .resolves(getAssetWithVersion);

    const restApi = getSpecificApi(
      "AUTH_TOKEN",
      "893f605e-10e2-423a-bdb4-f952f56eb6d8",
      "shopper-customers",
      null
    );

    expect(getAssetStub.called).to.be.false;
    return expect(restApi).to.be.null;
  });

  it("should return null if getAsset returns null", async () => {
    const getAssetStub = sinon
      .stub(exchangeDownloader, "getAsset")
      .resolves(null);

    const restApi = getSpecificApi(
      "AUTH_TOKEN",
      "893f605e-10e2-423a-bdb4-f952f56eb6d8",
      "shopper-customers",
      "0.0.1"
    );

    expect(getAssetStub.called).to.be.true;
    return expect(restApi).to.eventually.be.null;
  });
});

describe("getAsset", async () => {
  afterEach(nock.cleanAll);

  it("should return the requested asset", async () => {
    const scope = nock("https://anypoint.mulesoft.com/exchange/api/v2/assets");

    scope
      .get("/893f605e-10e2-423a-bdb4-f952f56eb6d8/shopper-customers/0.0.1")
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      .reply(200, getAssetWithVersion);

    return expect(
      getAsset(
        "AUTH_TOKEN",
        "893f605e-10e2-423a-bdb4-f952f56eb6d8/shopper-customers/0.0.1"
      )
    ).to.eventually.deep.equal(getAssetWithVersion);
  });

  it("should return null if it fails to download the asset", () => {
    const scope = nock("https://anypoint.mulesoft.com/exchange/api/v2/assets");

    scope
      .get("/893f605e-10e2-423a-bdb4-f952f56eb6d8/shopper-customers/0.0.1")
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      .reply(500, "Internal Server Error");

    return expect(
      getAsset(
        "AUTH_TOKEN",
        "893f605e-10e2-423a-bdb4-f952f56eb6d8/shopper-customers/0.0.1"
      )
    ).to.eventually.be.null;
  });
});

describe("getVersionByDeployment", () => {
  beforeEach(sinon.restore);

  it("returns a version if a deployment exists", async () => {
    const getAssetStub = sinon
      .stub(exchangeDownloader, "getAsset")
      .resolves(getAssetWithoutVersion);

    const version = getVersionByDeployment(
      "AUTH_TOKEN",
      REST_API,
      /production/i
    );

    expect(getAssetStub.called).to.be.true;
    return expect(version).to.eventually.equal("0.0.1");
  });

  it("returns the asset's version if no matching deployment is found", async () => {
    const getAssetStub = sinon
      .stub(exchangeDownloader, "getAsset")
      .resolves(getAssetWithoutVersion);

    const version = getVersionByDeployment(
      "AUTH_TOKEN",
      REST_API,
      /NOT AVAILABLE/i
    );

    expect(getAssetStub.called).to.be.true;
    return expect(version).to.eventually.equal(getAssetWithoutVersion.version);
  });

  it("returns null if the asset does not exist", async () => {
    const getAssetStub = sinon
      .stub(exchangeDownloader, "getAsset")
      .resolves(null);

    const version = getVersionByDeployment(
      "AUTH_TOKEN",
      REST_API,
      /NOT AVAILABLE/i
    );

    expect(getAssetStub.called).to.be.true;
    return expect(version).to.eventually.be.null;
  });
});
