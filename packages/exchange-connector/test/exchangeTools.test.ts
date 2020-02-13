/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { RestApi, groupByCategory } from "../src";
import _ from "lodash";

import { expect, default as chai } from "chai";
import chaiAsPromised from "chai-as-promised";

before(() => {
  chai.use(chaiAsPromised);
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
