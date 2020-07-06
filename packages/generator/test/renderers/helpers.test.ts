/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as renderer from "../../src/renderer";
import { RestApi, model } from "@commerce-apps/raml-toolkit";
import { default as chai, expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import tmp from "tmp";
import path from "path";
import fs from "fs-extra";
chai.use(chaiAsPromised);

const validRamlDir = path.join(__dirname, "../raml/valid");

function makeApiFamily(): RestApi[] {
  return [
    {
      id: "Test",
      assetId: "site",
      fatRaml: {
        mainFile: "site.raml"
      }
    }
  ] as RestApi[];
}

describe("Renderer Helpers", () => {
  describe("loadApiConfig", () => {
    it("loads the API config file specified by the build config", () => {
      const json = { key: "value", nested: { property: 1 } };
      const tmpFile = tmp.fileSync({ postfix: ".json" });
      fs.writeJsonSync(tmpFile.name, json);

      const apiConfig = renderer.loadApiConfig({
        inputDir: path.dirname(tmpFile.name),
        apiConfigFile: path.basename(tmpFile.name)
      });
      expect(apiConfig).to.not.equal(json);
      expect(apiConfig).to.deep.equal(json);
    });
  });

  describe("processApiFamily", () => {
    it("parses API family data into AMF models", async () => {
      const models = await renderer.processApiFamily(
        makeApiFamily(),
        validRamlDir
      );
      expect(models)
        .to.be.an("array")
        .with.lengthOf(1);
      expect(models[0].document).to.be.an.instanceOf(model.document.Document);
      expect(models[0]).to.deep.include({
        metadata: {
          id: "Test",
          assetId: "site",
          fatRaml: { mainFile: "site.raml" }
        }
      });
    });

    it("throws an error when ID is missing", () => {
      expect(
        renderer.processApiFamily(([{ id: "" }] as unknown) as RestApi[], "")
      ).to.eventually.be.rejected;
    });
  });

  describe("getApiModelTuples", async () => {
    it("returns an array of API family names and AMF models", async () => {
      const apiConfig = {
        test: makeApiFamily()
      };
      const buildConfig = {
        inputDir: validRamlDir
      };
      const result = await renderer.getApiModelTuples(apiConfig, buildConfig);
      expect(result)
        .to.be.an("array")
        .with.lengthOf(1);
      expect(result[0])
        .to.be.an("array")
        .with.lengthOf(2);
      expect(result[0][0]).to.equal("test");
      expect(result[0][1])
        .to.be.an("array")
        .with.lengthOf(1);
      expect(result[0][1][0].document).to.be.an.instanceOf(
        model.document.Document
      );
      expect(result[0][1][0]).to.deep.include({
        metadata: {
          id: "Test",
          assetId: "site",
          fatRaml: { mainFile: "site.raml" }
        }
      });
    });
  });
});
