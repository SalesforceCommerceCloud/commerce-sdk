"use strict";

import { assert, expect } from "chai";
import { processRamlFile } from "../src/utils/parser";
import { WebApiBaseUnit } from "webapi-parser";

describe("Test RAML file", () => {
  it("Test invalid RAML file", async () => {
    const ramlFile = `${__dirname}/raml/invalid/search-invalid.raml`;
    try {
      await processRamlFile(ramlFile);
      throw Error("Valid Invalid RAML file parsing to fail");
    } catch (err) {
      expect(err).to.not.equal(null);
    }
  });

  it("Test valid RAML file", async () => {
    const ramlFile = `${__dirname}/raml/valid/site.raml`;
    try {
      const res: WebApiBaseUnit = await processRamlFile(ramlFile);
      expect(res).to.not.equal(null);
      assert(true);
    } catch (err) {
      throw Error("Valid RAML file parsing should not fail: " + err.message);
    }
  });
});
