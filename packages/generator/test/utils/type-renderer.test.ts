"use strict";

import { TypeRenderer } from "../../src/utils/type-renderer";
import * as path from "path";
import * as tmp from "tmp";
import fs from "fs-extra";
import { assert, expect } from "chai";

const _rootdir = path.resolve(__dirname, "..");
const files = [
  {
    boundedContext: "shop",
    ramlFile: "/site.raml"
  }
];

describe("Type renderer tests", () => {
  it("empty root dir", async () => {
    const typeRenderer = new TypeRenderer(undefined);
    await typeRenderer.process(files);
  });

  it("empty raml files", async () => {
    const typeRenderer = new TypeRenderer("somedir");
    await typeRenderer.process(undefined);
  });

  it("invalid root dir", async () => {
    const tempFolder = tmp.dirSync();
    fs.copySync(path.resolve(_rootdir, "raml", "valid"), tempFolder.name);
    const typeRenderer = new TypeRenderer("invalid");
    try {
      await typeRenderer.process(files);
      assert.fail("Processing invalid RAML root dir should fail");
    } catch (e) {
      assert.isOk("is Ok to fail processing invalid RAML root dir");
    }
  });

  it("valid root dir", async () => {
    const tempFolder = tmp.dirSync({ keep: false });
    fs.copySync(path.resolve(_rootdir, "raml", "valid"), tempFolder.name);
    const typeRenderer = new TypeRenderer(tempFolder.name);
    await typeRenderer.process(files);
  });
});
