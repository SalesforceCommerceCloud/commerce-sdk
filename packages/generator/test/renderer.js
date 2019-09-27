const tmp = require("tmp");
const path = require("path");
import {
  createClient,
  copyStaticFiles,
  __RewireAPI__ as RendererRewireApi
} from "../src/utils/renderer";
import { assert } from "chai";
const fs = require("fs-extra");
const generator = require("../src/utils/parser");

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
  before(() => {
    let ramlFile = `${__dirname}/raml/valid/site.raml`;
    return generator
      .processRamlFile(ramlFile)
      .then(res => {
        model = res;
      })
      .catch(err => {
        throw Error("Valid RAML file parsing should not fail", err);
      });
  });

  it("createClient", () => {
    let tmpDir = tmp.dirSync();
    RendererRewireApi.__Rewire__("pkgDir", path.join(tmpDir.name, "pkg"));
    createClient(model);
    // TODO: Write assertion here
    RendererRewireApi.__ResetDependency__("pkgDir");
  });
});
