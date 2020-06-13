/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as renderer from "../../src/renderer";
import { model, RestApi } from "@commerce-apps/raml-toolkit";
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
  describe("sortApis", () => {
    it("sorts APIs alphabetically", () => {
      const api1: RestApi = {
        name: "B",
        id: "B",
        groupId: "B",
        assetId: "assignments"
      };
      const api2: RestApi = {
        name: "A",
        id: "A",
        groupId: "A",
        assetId: "assignments"
      };
      const api3: RestApi = {
        name: "C",
        id: "C",
        groupId: "C",
        assetId: "assignments"
      };
      const m = {} as model.domain.WebApi;
      const apiFamilies: renderer.IApiClientsInfo[][] = [
        [
          { family: "Shopper", model: m, config: api1 },
          { family: "Shopper", model: m, config: api2 },
          { family: "Shopper", model: m, config: api3 }
        ],
        [
          { family: "AI", model: m, config: api3 },
          { family: "AI", model: m, config: api2 },
          { family: "AI", model: m, config: api1 }
        ]
      ];

      renderer.sortApis(apiFamilies);
      expect(apiFamilies[0][0].family).to.equal("AI");
      expect(apiFamilies[0][0].config.name).to.equal("A");
      expect(apiFamilies[0][1].config.name).to.equal("B");
      expect(apiFamilies[0][2].config.name).to.equal("C");
      expect(apiFamilies[1][0].family).to.equal("Shopper");
      expect(apiFamilies[1][0].config.name).to.equal("A");
      expect(apiFamilies[1][1].config.name).to.equal("B");
      expect(apiFamilies[1][2].config.name).to.equal("C");
    });
  });

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
      expect(models[0]).to.be.an.instanceOf(model.document.Document);
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
      expect(result[0][1][0]).to.be.an.instanceOf(model.document.Document);
    });
  });

  describe("objectFromEntries", () => {
    type Entries = [string, unknown][];

    it("creates an empty object from an empty list of entries", () => {
      expect(renderer.objectFromEntries([])).to.deep.equal({});
    });

    it("creates an object with keys/values matching the list of entries", () => {
      const entries: Entries = [
        ["one", 1],
        ["two", 2]
      ];
      const object = { one: 1, two: 2 };
      expect(renderer.objectFromEntries(entries)).to.deep.equal(object);
    });

    it("preserves references to object and function values", () => {
      const nested = { property: "value" };
      const method = (): null => null;
      const result = renderer.objectFromEntries([
        ["nested", nested],
        ["method", method]
      ] as Entries);
      expect(result).to.deep.equal({ nested, method });
      expect(result.nested).to.equal(nested);
      expect(result.method).to.equal(method);
    });
  });
});
