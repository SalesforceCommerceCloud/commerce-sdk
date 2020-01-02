/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";
import { processRamlFile, getAllDataTypes } from "../src/parser";
import { WebApiBaseUnitWithDeclaresModel } from "webapi-parser";

import { expect, default as chai } from "chai";
import path from "path";
import chaiAsPromised from "chai-as-promised";
import _ from "lodash";

before(() => {
  chai.use(chaiAsPromised);
});

describe("Test RAML file", () => {
  it("Test invalid RAML file", () => {
    const ramlFile = path.join(__dirname, "/raml/invalid/search-invalid.raml");
    return expect(processRamlFile(ramlFile)).to.be.eventually.rejected;
  });

  it("Test valid RAML file", () => {
    const ramlFile = path.join(__dirname, "/raml/valid/site.raml");
    return processRamlFile(ramlFile)
      .then(s => {
        expect(s).to.not.equal(null);
      })
      .catch(e => {
        expect.fail(e.message, "Valid RAML file parsing should not fail");
      });
  });
});

describe("Get Data types", () => {
  it("Test valid RAML file", () => {
    const ramlFile = path.join(__dirname, "/raml/valid/site.raml");
    return processRamlFile(ramlFile).then(s => {
      const res = getAllDataTypes([s as WebApiBaseUnitWithDeclaresModel]);
      expect(_.map(res, res => res.name.value())).to.be.deep.equal([
        "product_search_result",
        "ClassA",
        "customer_product_list_item",
        "query",
        "ClassB",
        "search_request",
        "password_change_request",
        "sort",
        "result_page"
      ]);
    });
  });
});
