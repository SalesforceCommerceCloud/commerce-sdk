/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import os from "os";
import path from "path";
import fs from "fs-extra";
import { expect } from "chai";
import { getAPIDetailsFromSpec, resolveGeneratorFlags } from "./generate-oas";

type ApiSpecDetail = Parameters<typeof resolveGeneratorFlags>[0];

const buildDetail = (overrides: Partial<ApiSpecDetail>): ApiSpecDetail => ({
  filepath: "/tmp/spec.yaml",
  filename: "spec.yaml",
  name: "Ignored",
  apiName: "Ignored",
  directoryName: "ignored",
  ...overrides,
});

describe("resolveGeneratorFlags", () => {
  it("appends SET_TAGS_FOR_ALL_OPERATIONS for the Zones spec so tagged operations do not split into a second class", () => {
    const flags = resolveGeneratorFlags(
      buildDetail({ apiName: "CDNZones", name: "Zones OAS" })
    );

    expect(flags).to.include(
      "--openapi-normalizer SET_TAGS_FOR_ALL_OPERATIONS=default"
    );
    expect(flags).to.include("--reserved-words-mappings delete=delete");
  });

  it("still matches when a future Zones v2 renames the spec title, since apiName stays CDNZones", () => {
    const flags = resolveGeneratorFlags(
      buildDetail({ apiName: "CDNZones", name: "Zones OAS V2" })
    );

    expect(flags).to.include(
      "--openapi-normalizer SET_TAGS_FOR_ALL_OPERATIONS=default"
    );
  });

  it("returns the base flags unchanged for every other spec", () => {
    const flags = resolveGeneratorFlags(
      buildDetail({ apiName: "ShopperBaskets", name: "Shopper Baskets OAS" })
    );

    expect(flags).to.equal("--reserved-words-mappings delete=delete");
  });
});

describe("getAPIDetailsFromSpec", () => {
  let folder: string;

  const writeSpec = (fileName: string): void =>
    fs.writeFileSync(path.join(folder, fileName), "openapi: 3.0.3\n");

  beforeEach(() => {
    folder = fs.mkdtempSync(path.join(os.tmpdir(), "spec-folder-"));
  });

  afterEach(() => {
    fs.removeSync(folder);
  });

  it("derives the generator inputs from the spec file name alone", () => {
    writeSpec("source-code-groups-oas-v1-public.yaml");

    expect(getAPIDetailsFromSpec(folder)).to.deep.equal({
      filepath: path.join(folder, "source-code-groups-oas-v1-public.yaml"),
      filename: "source-code-groups-oas-v1-public.yaml",
      directoryName: "sourceCodeGroups",
      name: "Source Code Groups OAS",
      apiName: "SourceCodeGroups",
    });
  });

  it("keeps the class names the SDK already ships for APIs that need an override", () => {
    [
      ["shopper-seo-oas-v1-public.yaml", "ShopperSEO"],
      ["auth-oas-v1-public.yaml", "ShopperLogin"],
      ["zones-oas-v1-public.yaml", "CDNZones"],
      ["shopper-baskets-oas-v2-public.yaml", "ShopperBasketsV2"],
    ].forEach(([fileName, apiName]) => {
      const apiFolder = fs.mkdtempSync(path.join(folder, "api-"));
      fs.writeFileSync(path.join(apiFolder, fileName), "");

      expect(getAPIDetailsFromSpec(apiFolder).apiName).to.equal(apiName);
    });
  });

  it("fails when the folder holds no spec file", () => {
    expect(() => getAPIDetailsFromSpec(folder)).to.throw("No spec file found");
  });
});
