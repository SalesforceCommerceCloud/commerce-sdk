/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as diffProcessor from "@commerce-apps/raml-toolkit";
import { NodeDiff } from "@commerce-apps/raml-toolkit";
import { diffNewAndArchivedRamlFiles, RamlDiff } from "../src/gulpfileHelpers";
import { generatorLogger } from "../src/logger";

import _ from "lodash";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import fs from "fs-extra";
import path from "path";
import sinon from "sinon";
import tmp from "tmp";

const expect = chai.expect;
let tmpDir: tmp.DirResult;

before(() => {
  chai.should();
  chai.use(chaiAsPromised);
});

describe("diffNewAndArchivedRamlFiles", () => {
  let apiConfig;
  let apiConfigFile;
  let diffRamlStub: sinon.SinonStub;
  const nodeDiffArr = [];

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
    nodeDiffArr.push(new NodeDiff("#/web-api/end-points/test-endpoint"));
    diffRamlStub = sinon.stub(diffProcessor, "diffRaml");
  });

  beforeEach(() => {
    tmpDir = tmp.dirSync();
    apiConfigFile = path.join(tmpDir.name, "api-config.json");
    fs.writeFileSync(apiConfigFile, JSON.stringify(apiConfig));
    diffRamlStub.reset();
    diffRamlStub.resolves(nodeDiffArr);
  });

  it("should return diff on all the apis in api-config.json", async () => {
    const result: RamlDiff[] = await diffNewAndArchivedRamlFiles(
      "leftDir",
      "rightDir",
      apiConfigFile,
      apiConfigFile
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
    fs.writeFileSync(
      apiConfigFile,
      JSON.stringify({ family1: [apiConfig["family1"][0]] })
    );
    const error = "The operation was unsuccessful";

    const result: RamlDiff[] = await diffNewAndArchivedRamlFiles(
      "leftDir",
      "rightDir",
      apiConfigFile,
      apiConfigFile
    );

    expect(diffRamlStub.calledOnce).to.be.true;
    expect(result[0].file).to.equal("api1/api1.raml");
    expect(result[0].message).to.equal(error);
  });

  it("should not return anything for the api if no diff is found", async () => {
    diffRamlStub.reset();
    diffRamlStub.resolves([]);
    fs.writeFileSync(
      apiConfigFile,
      JSON.stringify({ family1: [apiConfig["family1"][0]] })
    );

    const result: RamlDiff[] = await diffNewAndArchivedRamlFiles(
      "leftDir",
      "rightDir",
      apiConfigFile,
      apiConfigFile
    );

    expect(diffRamlStub.calledOnce).to.be.true;
    expect(result.length).to.equal(0);
  });

  it("should report the removed apis", async () => {
    const apiConfigCopy = _.cloneDeep(apiConfig);
    apiConfigCopy.family2 = [apiConfig["family2"][0]];
    const apiConfigFile2 = path.join(tmp.dirSync().name, "api-config.json");
    fs.writeFileSync(apiConfigFile2, JSON.stringify(apiConfigCopy));

    const result: RamlDiff[] = await diffNewAndArchivedRamlFiles(
      "leftDir",
      "rightDir",
      apiConfigFile,
      apiConfigFile2
    );

    expect(diffRamlStub.calledThrice).to.be.true;
    expect(result[0].diff).to.equal(nodeDiffArr);
    expect(result[1].diff).to.equal(nodeDiffArr);
    expect(result[2].diff).to.equal(nodeDiffArr);
    expect(result[3].message).to.equal("This RAML has been removed");
    expect(result[3].diff).to.be.undefined;
  });

  it("should report all the apis in the removed apiFamily", async () => {
    const apiConfigFile2 = path.join(tmp.dirSync().name, "api-config.json");
    fs.writeFileSync(
      apiConfigFile2,
      JSON.stringify({ family1: apiConfig["family1"] })
    );

    const result: RamlDiff[] = await diffNewAndArchivedRamlFiles(
      "leftDir",
      "rightDir",
      apiConfigFile,
      apiConfigFile2
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
    const apiConfigFile2 = path.join(tmp.dirSync().name, "api-config.json");
    fs.writeFileSync(apiConfigFile2, JSON.stringify(apiConfigCopy));

    const result: RamlDiff[] = await diffNewAndArchivedRamlFiles(
      "leftDir",
      "rightDir",
      apiConfigFile2,
      apiConfigFile
    );

    expect(diffRamlStub.calledThrice).to.be.true;
    expect(result[0].diff).to.equal(nodeDiffArr);
    expect(result[1].diff).to.equal(nodeDiffArr);
    expect(result[2].diff).to.equal(nodeDiffArr);
    expect(result[3].message).to.equal("This RAML has been added recently");
    expect(result[3].diff).to.be.undefined;
  });

  it("should report apis in the newly added api family", async () => {
    const apiConfigFile2 = path.join(tmp.dirSync().name, "api-config.json");
    fs.writeFileSync(
      apiConfigFile2,
      JSON.stringify({ family1: apiConfig["family1"] })
    );

    const result: RamlDiff[] = await diffNewAndArchivedRamlFiles(
      "leftDir",
      "rightDir",
      apiConfigFile2,
      apiConfigFile
    );

    expect(diffRamlStub.calledTwice).to.be.true;
    expect(result[0].diff).to.equal(nodeDiffArr);
    expect(result[1].diff).to.equal(nodeDiffArr);
    expect(result[2].message).to.equal("This RAML has been added recently");
    expect(result[3].message).to.equal("This RAML has been added recently");
  });
});
