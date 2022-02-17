/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { registerHelpers, registerPartials, setupApis } from "./utils";

import { expect } from "chai";
import { generate } from "@commerce-apps/raml-toolkit";
import sinon from "sinon";

const sandbox = sinon.createSandbox();

const Handlebars = generate.HandlebarsWithAmfHelpers;
const API_DIRECTORY = `${__dirname}/../../apis`;

describe("registerHelper", () => {
  it("registers our custom helpers", () => {
    expect(Object.keys(Handlebars.helpers)).to.not.include.members([
      "addNamespace",
      "formatForTsDoc",
      "isCommonPathParameter",
      "isCommonQueryParameter",
    ]);

    registerHelpers();

    expect(Object.keys(Handlebars.helpers)).to.include.members([
      "addNamespace",
      "formatForTsDoc",
      "isCommonPathParameter",
      "isCommonQueryParameter",
    ]);
  });
});

describe("registerPartials", () => {
  it("registers our partials", () => {
    expect(Object.keys(Handlebars.partials)).to.not.include.members([
      "dtoPartial",
      "operationsPartial",
    ]);

    registerPartials();

    expect(Object.keys(Handlebars.partials)).to.include.members([
      "dtoPartial",
      "operationsPartial",
    ]);
  });
});

describe("setupApis", () => {
  afterEach(() => {
    sandbox.restore();
  });
  it("loads our API modes", async function () {
    // Don't need to perform the init, and doing so will cause timeout.
    sandbox.stub(generate.ApiMetadata.prototype, "init").resolves();

    const apis = await setupApis(
      API_DIRECTORY,
      `${__dirname}/../renderedTemplates`
    );

    expect(apis.name.original).to.equal("apis");
    const children = apis.children.map((child) => child.name.original);
    expect(children).to.have.members([
      "pricing",
      "customer",
      "checkout",
      "product",
      "cdn",
      "discovery",
      "search",
    ]);
  });
});
