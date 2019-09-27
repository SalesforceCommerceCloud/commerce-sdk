const tmp = require("tmp");
const path = require("path");
import {
  createClient,
  copyStaticFiles,
  __RewireAPI__ as RendererRewireApi
} from "../src/utils/renderer";
import { assert } from "chai";
var chai = require("chai");
const fs = require("fs-extra");
const generator = require("../src/utils/parser");

chai.use(require("chai-string"));

describe("copy static files tests", () => {
  it("copy those files", () => {
    let tmpDir = tmp.dirSync();
    RendererRewireApi.__Rewire__("pkgDir", path.join(tmpDir.name, "pkg"));
    copyStaticFiles();
    assert.isTrue(fs.existsSync(path.join(tmpDir.name, "pkg")));
    assert.isTrue(fs.existsSync(path.join(tmpDir.name, "pkg/core")));
    assert.isTrue(fs.existsSync(path.join(tmpDir.name, "pkg/core/index.js")));
    RendererRewireApi.__ResetDependency__("pkgDir");
  });
});

describe("create client test code", () => {
  let model = {};
  // eslint-disable-next-line no-undef
  beforeEach(() => {
    let ramlFile = `${__dirname}/raml/valid/site.raml`;
    return generator
      .processRamlFile(ramlFile)
      .then(res => {
        model = res.encodes;
      })
      .catch(err => {
        throw Error("Valid RAML file parsing should not fail", err);
      });
  });

  it("createClient", () => {
    let tmpDir = tmp.dirSync();
    RendererRewireApi.__Rewire__("pkgDir", path.join(tmpDir.name, "pkg"));
    createClient(model);
    let expected = `export default class extends BaseClient {
      constructor() {
          super("https://anypoint.mulesoft.com/mocking/api/v1/links/27d5ffea-96a7-447b-b595-2b0e837a20c6/s/-/dw/shop/v19_5");
      }

      getSite() {
          this.get("/site");
    }`;
    let actual = fs
      .readFileSync(path.join(tmpDir.name, "pkg/shop.js"))
      .toString();

    assert.containIgnoreSpaces(actual, expected);
    RendererRewireApi.__ResetDependency__("pkgDir");
  });
});
