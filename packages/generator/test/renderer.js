const tmp = require("tmp");
const path = require("path");
import {
  createIndex,
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
    createClient(model, "shop");

    let actual = fs
      .readFileSync(path.join(tmpDir.name, "pkg/shop.js"))
      .toString();

    assert.containIgnoreSpaces(
      actual,
      "https://anypoint.mulesoft.com/mocking/api/v1/links/27d5ffea-96a7-447b-b595-2b0e837a20c6/s/-/dw/shop/v19_5"
    );
    assert.containIgnoreSpaces(actual, `this.get("/site");`);
    RendererRewireApi.__ResetDependency__("pkgDir");
  });
});

describe("create client test code", () => {
  it("createClient", () => {
    let tmpDir = tmp.dirSync();
    RendererRewireApi.__Rewire__("pkgDir", path.join(tmpDir.name, "pkg"));

    let files = [
      {
        boundedContext: "shop",
        ramlFile: `${__dirname}/../raml/shop/site.raml`
      }
    ];
    createIndex(files);

    let actual = fs
      .readFileSync(path.join(tmpDir.name, "pkg/index.js"))
      .toString();

    assert.containIgnoreSpaces(
      actual,
      `import {default as shop } from "./shop"`
    );
    assert.containIgnoreSpaces(actual, `export let shopClient = new shop();`);
    RendererRewireApi.__ResetDependency__("pkgDir");
  });
});
