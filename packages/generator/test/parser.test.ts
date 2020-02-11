/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";
import {
  processRamlFile,
  getAllDataTypes,
  getApiName,
  groupByCategory,
  getNormalizedName
} from "../src/parser";
import {
  WebApiBaseUnitWithDeclaresModel,
  WebApiParser,
  model,
  webapi
} from "webapi-parser";

import { expect, default as chai } from "chai";
import path from "path";
import chaiAsPromised from "chai-as-promised";
import _ from "lodash";
import { RestApi } from "@commerce-apps/exchange-connector";

before(() => {
  chai.use(chaiAsPromised);
});

describe("Test RAML file", () => {
  it("Test invalid RAML file", () => {
    const ramlFile = path.join(__dirname, "/raml/invalid/search-invalid.raml");
    return expect(processRamlFile(ramlFile)).to.be.eventually.rejected;
  });

  it("Test valid RAML file", () => {
    const ramlFile = path.join(__dirname, "/raml/valid/site/site.raml");
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
    const ramlFile = path.join(__dirname, "/raml/valid/site/site.raml");
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

  it("Test valid RAML file with references", () => {
    const ramlFile = path.join(__dirname, "/raml/valid/site/site.raml");
    return processRamlFile(ramlFile).then(s => {
      s.withReferences([s]);
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

describe("Test that API Name is returned in lower camelCase", () => {
  const domain = model.domain;
  before(() => {
    WebApiParser.init();
  });

  const expectedApiName = "shopperCustomers";
  it("Test with space in the name", () => {
    const api = new domain.WebApi();
    api.withName("Shopper Customers");
    const model = new webapi.WebApiExternalFragment().withEncodes(api);
    return expect(getApiName(model)).to.equal(expectedApiName);
  });
  it("Test with - in the name", () => {
    const api = new domain.WebApi();
    api.withName("Shopper-Customers");
    const model = new webapi.WebApiExternalFragment().withEncodes(api);
    return expect(getApiName(model)).to.equal(expectedApiName);
  });
  it("Test with _ in the name", () => {
    const api = new domain.WebApi();
    api.withName("Shopper-Customers");
    const model = new webapi.WebApiExternalFragment().withEncodes(api);
    return expect(getApiName(model)).to.equal(expectedApiName);
  });
  it("Test with . in the name", () => {
    const api = new domain.WebApi();
    api.withName("shopper.customers");
    const model = new webapi.WebApiExternalFragment().withEncodes(api);
    return expect(getApiName(model)).to.equal(expectedApiName);
  });
  it("Test with all lowercase name", () => {
    const api = new domain.WebApi();
    api.withName("shopper customers");
    const model = new webapi.WebApiExternalFragment().withEncodes(api);
    return expect(getApiName(model)).to.equal(expectedApiName);
  });
  it("Test with camelCase name", () => {
    const api = new domain.WebApi();
    api.withName("shopperCustomers");
    const model = new webapi.WebApiExternalFragment().withEncodes(api);
    return expect(getApiName(model)).to.equal(expectedApiName);
  });
  it("Test with null API name", () => {
    const api = new domain.WebApi();
    api.withName(null);
    const model = new webapi.WebApiExternalFragment().withEncodes(api);
    return expect(() => getApiName(model)).to.throw(
      "Invalid name provided to normalize"
    );
  });
  it("Test with undefined API name", () => {
    const api = new domain.WebApi();
    api.withName(undefined);
    const model = new webapi.WebApiExternalFragment().withEncodes(api);
    return expect(() => getApiName(model)).to.throw(
      "Invalid name provided to normalize"
    );
  });
  it("Test with empty API name", () => {
    const api = new domain.WebApi();
    api.withName("");
    const model = new webapi.WebApiExternalFragment().withEncodes(api);
    return expect(() => getApiName(model)).to.throw(
      "Invalid name provided to normalize"
    );
  });
});

describe("Test groupByCategory method", () => {
  const apis: RestApi[] = [
    {
      id: "8888888/test-api/1.0.0",
      name: "Test API",
      groupId: "8888888",
      assetId: "test-api",
      version: "1.0.0"
    },
    {
      id: "8888888/test-api-2/1.0.0",
      name: "Test API 2",
      groupId: "8888888",
      assetId: "test-api-2",
      version: "1.0.0"
    },
    {
      id: "8888888/test-api-3/1.0.0",
      name: "Test API 3",
      groupId: "8888888",
      assetId: "test-api-3",
      version: "1.0.0"
    },
    {
      id: "8888888/test-api-4/1.0.0",
      name: "Test API 4",
      groupId: "8888888",
      assetId: "test-api-4",
      version: "1.0.0"
    }
  ];

  it("Group Apis (All same category)", () => {
    const safeApisObject = _.cloneDeep(apis);
    safeApisObject.forEach(api => {
      api.categories = {
        "Api Family": ["something"]
      };
    });

    expect(groupByCategory(safeApisObject, "Api Family")).to.deep.equal({
      something: safeApisObject
    });
  });

  it("Group Apis (All same category w/o allowing unclassified)", () => {
    const safeApisObject = _.cloneDeep(apis);
    safeApisObject.forEach(api => {
      api.categories = {
        "Api Family": ["something"]
      };
    });

    expect(groupByCategory(safeApisObject, "Api Family", false)).to.deep.equal({
      something: safeApisObject
    });
  });

  it("Group Apis (two categories)", () => {
    const safeApisObject = _.cloneDeep(apis);

    safeApisObject[0].categories = {
      "Api Family": ["foo"]
    };
    safeApisObject[1].categories = {
      "Api Family": ["bar"]
    };
    safeApisObject[2].categories = {
      "Api Family": ["foo"]
    };
    safeApisObject[3].categories = {
      "Api Family": ["bar"]
    };

    expect(groupByCategory(safeApisObject, "Api Family")).to.deep.equal({
      foo: [safeApisObject[0], safeApisObject[2]],
      bar: [safeApisObject[1], safeApisObject[3]]
    });
  });

  it("Group Apis (four categories)", () => {
    const safeApisObject = _.cloneDeep(apis);

    safeApisObject[0].categories = {
      "Api Family": ["foo"]
    };
    safeApisObject[1].categories = {
      "Api Family": ["bar"]
    };
    safeApisObject[2].categories = {
      "Api Family": ["see"]
    };
    safeApisObject[3].categories = {
      "Api Family": ["dog"]
    };

    expect(groupByCategory(safeApisObject, "Api Family")).to.deep.equal({
      foo: [safeApisObject[0]],
      bar: [safeApisObject[1]],
      see: [safeApisObject[2]],
      dog: [safeApisObject[3]]
    });
  });

  it("Group Apis (missing category allow unclassified)", () => {
    const safeApisObject = _.cloneDeep(apis);

    safeApisObject[0].categories = {
      "Api Family": ["foo"]
    };
    safeApisObject[2].categories = {
      "Api Family": ["see"]
    };
    safeApisObject[3].categories = {
      "Api Family": ["dog"]
    };

    expect(groupByCategory(safeApisObject, "Api Family")).to.deep.equal({
      foo: [safeApisObject[0]],
      see: [safeApisObject[2]],
      dog: [safeApisObject[3]],
      unclassified: [safeApisObject[1]]
    });
  });

  it("Group Apis (missing category without allowing unclassified)", () => {
    const safeApisObject = _.cloneDeep(apis);

    safeApisObject[0].categories = {
      "Api Family": ["foo"]
    };
    safeApisObject[2].categories = {};

    safeApisObject[2].categories = {
      "Api Family": ["see"]
    };
    safeApisObject[3].categories = {
      "Api Family": ["dog"]
    };

    expect(() => groupByCategory(safeApisObject, "Api Family", false)).to.throw(
      "Unclassified APIs are NOT allowed!"
    );
  });

  it("Group Apis (wrong category with allowing unclassified)", () => {
    const safeApisObject = _.cloneDeep(apis);

    safeApisObject[0].categories = {
      "Api Family": ["foo"]
    };
    safeApisObject[2].categories = {
      "CC Api Family": ["bar"]
    };

    safeApisObject[2].categories = {
      "Api Family": ["see"]
    };
    safeApisObject[3].categories = {
      "Api Family": ["dog"]
    };

    expect(groupByCategory(safeApisObject, "Api Family")).to.deep.equal({
      foo: [safeApisObject[0]],
      see: [safeApisObject[2]],
      dog: [safeApisObject[3]],
      unclassified: [safeApisObject[1]]
    });
  });
});
