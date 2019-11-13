"use strict";

import path from "path";
import fs from "fs";
import { expect } from "chai";
import {
  extractFiles,
  getRamlFromDirectory
} from "../src/exchangeDirectoryParser";
import sinon from "sinon";

describe("Test Exchange directory parser with empty directory", () => {
  let sandbox;
  let readdirSyncStubbed;

  before(() => {
    sandbox = sinon.createSandbox();
    readdirSyncStubbed = sandbox.stub(fs, "readdirSync").returns([]);
  });

  after(() => {
    sandbox.restore();
  });

  it("returns empty promise when directory is empty", () => {
    let filesPromises = undefined;
    return extractFiles("").then(s => {
      filesPromises = s;
      expect(filesPromises).to.be.empty;
    });
  });

  it("returns empty RAML files when directory is empty", () => {
    const ramlFiles = getRamlFromDirectory("");
    expect(ramlFiles).to.be.empty;
  });
});

describe("Test Exchange directory parser with no files in directory", () => {
  let sandbox;
  let readdirSyncStubbed;
  let existsSyncStubbed;
  const invalid = {
    name: "some_valid_file_or_dir_name",
    isFile: () => false,
    isDirectory: () => true
  };
  before(() => {
    sandbox = sinon.createSandbox();
    readdirSyncStubbed = sandbox
      .stub(fs, "readdirSync")
      .returns([invalid, invalid]);
    existsSyncStubbed = sandbox.stub(fs, "existsSync").returns(false);
  });

  after(() => {
    sandbox.restore();
  });

  it("returns empty promise when there are no files", () => {
    let filesPromises = undefined;

    return extractFiles("some_valid_dir").then(s => {
      filesPromises = s;
      expect(filesPromises).to.be.empty;
    });
  });

  it("returns empty RAML files when there are no files", () => {
    const ramlFiles = getRamlFromDirectory("some_valid_dir");
    expect(ramlFiles).to.be.empty;
  });
});

describe("Test Exchange directory parser with no directories in downloaded folder", () => {
  let sandbox;
  let readdirSyncStubbed;
  let existsSyncStubbed;
  const invalid = {
    name: "some_valid_file_or_dir_name",
    isFile: () => true,
    isDirectory: () => false
  };
  before(() => {
    sandbox = sinon.createSandbox();
    readdirSyncStubbed = sandbox
      .stub(fs, "readdirSync")
      .returns([invalid, invalid]);
    existsSyncStubbed = sandbox.stub(fs, "existsSync").returns(true);
  });

  after(() => {
    sandbox.restore();
  });

  it("returns empty RAML files when there are no directories in downloaded folder", () => {
    const ramlFiles = getRamlFromDirectory("some_valid_dir");
    expect(ramlFiles).to.be.empty;
  });
});

describe("Test Exchange directory parser with directories in downloaded folder", () => {
  let sandbox;
  let readdirSyncStubbed;
  let existsSyncStubbed;
  const valid = {
    name: "resources",
    isFile: () => false,
    isDirectory: () => true
  };
  before(() => {
    sandbox = sinon.createSandbox();
    readdirSyncStubbed = sandbox.stub(fs, "readdirSync").returns([valid]);
    existsSyncStubbed = sandbox.stub(fs, "existsSync").returns(true);
  });

  after(() => {
    sandbox.restore();
  });

  it("Throws exchange.json not found error when there is no exchange.json", () => {
    expect(() => getRamlFromDirectory("some_valid_dir")).throw();
  });

  it("Returns raml files when there is exchange.json", () => {
    const ramlFiles = getRamlFromDirectory("test");
    expect(ramlFiles.length).to.equals(1);
    expect(ramlFiles[0]).to.equals(
      path.join(path.resolve("test"), "resources", "somemain")
    );
  });
});
