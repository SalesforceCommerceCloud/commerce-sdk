/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { extractFiles } from "../src/exchangeDirectoryParser";

import { expect, default as chai } from "chai";
import chaiAsPromised from "chai-as-promised";
import JSZip from "jszip";
import tmp from "tmp";
import path from "path";
import fs from "fs-extra";

before(() => {
  chai.should();
  chai.use(chaiAsPromised);
});

describe("Test Extract files", () => {
  it("with zip file", () => {
    const directory = tmp.dirSync();
    const zip = new JSZip();
    zip.file("exchange.json", "{}");

    return new Promise(resolve => {
      zip
        .generateNodeStream({ type: "nodebuffer", streamFiles: true })
        .pipe(
          fs
            .createWriteStream(path.join(directory.name, "some-api.zip"))
            .on("finish", resolve)
        );
    })
      .then(() => extractFiles(directory.name))
      .then(() => {
        const content = fs.readFileSync(
          path.join(directory.name, "some-api", "exchange.json")
        );
        return expect(content.toString()).to.be.equal("{}");
      });
  });
});
