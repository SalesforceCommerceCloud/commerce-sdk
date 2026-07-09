/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from "chai";
import { resolveGeneratorFlags } from "./generate-oas";

type ApiSpecDetail = Parameters<typeof resolveGeneratorFlags>[0];

const buildDetail = (name: string): ApiSpecDetail => ({
  filepath: "/tmp/spec.yaml",
  filename: "spec.yaml",
  name,
  apiName: "Ignored",
  directoryName: "ignored",
});

describe("resolveGeneratorFlags", () => {
  it("appends SET_TAGS_FOR_ALL_OPERATIONS for the Zones spec so tagged operations do not split into a second class", () => {
    const flags = resolveGeneratorFlags(buildDetail("Zones OAS"));

    expect(flags).to.include(
      "--openapi-normalizer SET_TAGS_FOR_ALL_OPERATIONS=default"
    );
    expect(flags).to.include("--reserved-words-mappings delete=delete");
  });

  it("returns the base flags unchanged for every other spec", () => {
    const flags = resolveGeneratorFlags(buildDetail("Shopper Baskets OAS"));

    expect(flags).to.equal("--reserved-words-mappings delete=delete");
  });
});
