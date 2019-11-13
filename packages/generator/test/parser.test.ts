"use strict";
import { processRamlFile } from "../src/parser";
import { WebApiBaseUnit } from "webapi-parser";

import { expect, default as chai } from "chai";
import chaiAsPromised from "chai-as-promised";

before(() => {
  chai.use(chaiAsPromised);
});

describe("Test RAML file", () => {
  it("Test invalid RAML file", () => {
    const ramlFile = `${__dirname}/raml/invalid/search-invalid.raml`;
    return expect(processRamlFile(ramlFile)).to.be.eventually.rejected;
  });

  it("Test valid RAML file", () => {
    const ramlFile = `${__dirname}/raml/valid/site.raml`;
    return processRamlFile(ramlFile)
      .then(s => {
        expect(s).to.not.equal(null);
      })
      .catch(e => {
        expect.fail(e.message, "Valid RAML file parsing should not fail");
      });
  });
});
