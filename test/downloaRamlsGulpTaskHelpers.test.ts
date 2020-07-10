/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as diffProcessor from "@commerce-apps/raml-toolkit";
import { NodeDiff, RamlDiff } from "@commerce-apps/raml-toolkit";
import { diffNewAndArchivedRamlFiles } from "../src/downloadRamlsGulpTaskHelpers";

import _ from "lodash";
import { expect } from "chai";
import fs from "fs-extra";
import path from "path";
import sinon from "sinon";
import tmp from "tmp";

describe("diffNewAndArchivedRamlFiles", () => {
  let leftDir: string;
  let rightDir: string;
  let leftApiConfigFile: string;
  let rightApiConfigFile: string;
  let apiConfig: Record<string, unknown>;
  let diffRamlStub: sinon.SinonStub;

  const API_CONFIG_FILE_NAME = "api-config.json";
  const nodeDiffArr: NodeDiff[] = [];

  before(() => {
    apiConfig = {
      family1: [
        { assetId: "api1", fatRaml: { mainFile: "api1.raml" } },
        { assetId: "api2", fatRaml: { mainFile: "api2.raml" } }
      ],
      family2: [
        { assetId: "api3", fatRaml: { mainFile: "api3.raml" } },
        { assetId: "api4", fatRaml: { mainFile: "api4.raml" } }
      ]
    };
    nodeDiffArr.push(new NodeDiff("#/web-api/endpoints/test-endpoint"));
    diffRamlStub = sinon.stub(diffProcessor, "diffRaml");
  });

  beforeEach(() => {
    leftDir = tmp.dirSync().name;
    rightDir = tmp.dirSync().name;
    leftApiConfigFile = path.join(leftDir, API_CONFIG_FILE_NAME);
    rightApiConfigFile = path.join(rightDir, API_CONFIG_FILE_NAME);
    fs.writeJsonSync(leftApiConfigFile, apiConfig);
    fs.copyFileSync(leftApiConfigFile, rightApiConfigFile);
    diffRamlStub.reset();
    diffRamlStub.resolves(nodeDiffArr);
  });

  it("should return diff on all the apis in api-config.json", async () => {
    const result: RamlDiff[] = await diffNewAndArchivedRamlFiles(
      leftDir,
      rightDir,
      API_CONFIG_FILE_NAME
    );

    expect(result.length).to.equal(4);
    expect(diffRamlStub.callCount).to.equal(4);
    expect(result[0].file).to.equal("api1/api1.raml");
    expect(result[1].file).to.equal("api2/api2.raml");
    expect(result[2].file).to.equal("api3/api3.raml");
    expect(result[3].file).to.equal("api4/api4.raml");
    expect(result[0].diff).to.equal(nodeDiffArr);
    expect(result[1].diff).to.equal(nodeDiffArr);
    expect(result[2].diff).to.equal(nodeDiffArr);
    expect(result[3].diff).to.equal(nodeDiffArr);
  });

  it("should not fail if diffRaml throws an error", async () => {
    diffRamlStub.reset();
    diffRamlStub.rejects(new Error("Not found"));
    fs.writeJsonSync(leftApiConfigFile, { family1: [apiConfig["family1"][0]] });
    fs.copyFileSync(leftApiConfigFile, rightApiConfigFile);
    const error = "The operation was unsuccessful";

    const result: RamlDiff[] = await diffNewAndArchivedRamlFiles(
      leftDir,
      rightDir,
      API_CONFIG_FILE_NAME
    );

    expect(diffRamlStub.calledOnce).to.be.true;
    expect(result[0].file).to.equal("api1/api1.raml");
    expect(result[0].message).to.equal(error);
  });

  it("should not return anything for the api if no diff is found", async () => {
    diffRamlStub.reset();
    diffRamlStub.resolves([]);
    fs.writeJSONSync(leftApiConfigFile, { family1: [apiConfig["family1"][0]] });
    fs.copyFileSync(leftApiConfigFile, rightApiConfigFile);

    const result: RamlDiff[] = await diffNewAndArchivedRamlFiles(
      leftDir,
      rightDir,
      API_CONFIG_FILE_NAME
    );

    expect(diffRamlStub.calledOnce).to.be.true;
    expect(result.length).to.equal(0);
  });

  it("should report the removed apis", async () => {
    const apiConfigCopy = _.cloneDeep(apiConfig);
    apiConfigCopy.family2 = [apiConfig["family2"][0]];
    fs.writeFileSync(rightApiConfigFile, JSON.stringify(apiConfigCopy));

    const result: RamlDiff[] = await diffNewAndArchivedRamlFiles(
      leftDir,
      rightDir,
      API_CONFIG_FILE_NAME
    );

    expect(diffRamlStub.calledThrice).to.be.true;
    expect(result[0].diff).to.equal(nodeDiffArr);
    expect(result[1].diff).to.equal(nodeDiffArr);
    expect(result[2].diff).to.equal(nodeDiffArr);
    expect(result[3].message).to.equal("This RAML has been removed");
    expect(result[3].diff).to.be.undefined;
  });

  it("should report all the apis in the removed apiFamily", async () => {
    fs.writeJsonSync(rightApiConfigFile, { family1: apiConfig["family1"] });

    const result: RamlDiff[] = await diffNewAndArchivedRamlFiles(
      leftDir,
      rightDir,
      API_CONFIG_FILE_NAME
    );

    expect(diffRamlStub.calledTwice).to.be.true;
    expect(result[0].diff).to.equal(nodeDiffArr);
    expect(result[1].diff).to.equal(nodeDiffArr);
    expect(result[2].message).to.equal("This RAML has been removed");
    expect(result[3].message).to.equal("This RAML has been removed");
  });

  it("should report added apis", async () => {
    const apiConfigCopy = _.cloneDeep(apiConfig);
    apiConfigCopy.family2 = [apiConfig["family2"][0]];
    fs.writeJsonSync(leftApiConfigFile, apiConfigCopy);

    const result: RamlDiff[] = await diffNewAndArchivedRamlFiles(
      leftDir,
      rightDir,
      API_CONFIG_FILE_NAME
    );

    expect(diffRamlStub.calledThrice).to.be.true;
    expect(result[0].diff).to.equal(nodeDiffArr);
    expect(result[1].diff).to.equal(nodeDiffArr);
    expect(result[2].diff).to.equal(nodeDiffArr);
    expect(result[3].message).to.equal("This RAML has been added recently");
    expect(result[3].diff).to.be.undefined;
  });

  it("should report apis in the newly added api family", async () => {
    fs.writeJsonSync(leftApiConfigFile, { family1: apiConfig["family1"] });

    const result: RamlDiff[] = await diffNewAndArchivedRamlFiles(
      leftDir,
      rightDir,
      API_CONFIG_FILE_NAME
    );

    expect(diffRamlStub.calledTwice).to.be.true;
    expect(result[0].diff).to.equal(nodeDiffArr);
    expect(result[1].diff).to.equal(nodeDiffArr);
    expect(result[2].message).to.equal("This RAML has been added recently");
    expect(result[3].message).to.equal("This RAML has been added recently");
  });
});
