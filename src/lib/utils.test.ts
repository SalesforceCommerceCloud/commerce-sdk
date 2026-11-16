/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import fs from "fs-extra";
import { expect } from "chai";
import sinon from "sinon";
import {
  ecomRefForVersion,
  parseEcomVersion,
  parseEcomVersionArg,
  parseSingleApiArgs,
  readApiVersions,
  rejectUnknownArgs,
  setEcomVersionHeader,
} from "./utils";
import { API_VERSIONS_FILE } from "./config";

describe("readApiVersions", () => {
  // A private sandbox: sinon.restore() would also undo spies other test files
  // create at load time.
  const sandbox = sinon.createSandbox();
  let readFileSyncStub: sinon.SinonStub;
  let existsSyncStub: sinon.SinonStub;

  beforeEach(() => {
    existsSyncStub = sandbox.stub(fs, "existsSync").returns(true);
    readFileSyncStub = sandbox.stub(fs, "readFileSync");
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("reads each key and its bundle location, skipping comments and blanks", () => {
    readFileSyncStub.returns(`# APIs for ECOM v27.1
shopper-baskets-oas-v1=shopper/checkout/shopper-baskets/v1

  shopper-baskets-oas-v2 = shopper/checkout/shopper-baskets/v2
auth-oas-v1=shopper/shopper/auth/v1
`);

    expect(readApiVersions()).to.deep.equal([
      {
        apiName: "shopper-baskets-oas-v1",
        bundlePath: "shopper/checkout/shopper-baskets/v1",
      },
      {
        apiName: "shopper-baskets-oas-v2",
        bundlePath: "shopper/checkout/shopper-baskets/v2",
      },
      { apiName: "auth-oas-v1", bundlePath: "shopper/shopper/auth/v1" },
    ]);
    expect(readFileSyncStub.calledWith(API_VERSIONS_FILE, "utf-8")).to.be.true;
  });

  it("throws when the file does not exist", () => {
    existsSyncStub.returns(false);

    expect(() => readApiVersions()).to.throw(
      `API versions file not found at: ${API_VERSIONS_FILE}`
    );
  });

  [
    ["a missing location", "shopper-baskets-oas-v1="],
    ["a semantic version", "shopper-baskets-oas-v1=1.12.0"],
    ["a parent-directory segment", "shopper-baskets-oas-v1=../shopper/v1"],
    ["an absolute path", "shopper-baskets-oas-v1=/shopper/checkout/v1"],
    ["a shell metacharacter", "shopper-baskets-oas-v1=shopper/a;b/v1"],
    [
      "a version that differs from the key",
      "shopper-baskets-oas-v1=shopper/checkout/shopper-baskets/v2",
    ],
  ].forEach(([label, line]) => {
    it(`rejects ${label}`, () => {
      readFileSyncStub.returns(line);

      expect(() => readApiVersions()).to.throw("shopper-baskets-oas-v1");
    });
  });

  [
    [
      "a repeated key",
      "shopper-baskets-oas-v1=shopper/checkout/shopper-baskets/v1\nshopper-baskets-oas-v1=shopper/checkout/baskets/v1",
      "shopper-baskets-oas-v1",
    ],
    [
      "a repeated location",
      "shopper-baskets-oas-v1=shopper/checkout/shopper-baskets/v1\nbaskets-oas-v1=shopper/checkout/shopper-baskets/v1",
      "shopper/checkout/shopper-baskets/v1",
    ],
  ].forEach(([label, content, repeated]) => {
    it(`rejects ${label}`, () => {
      readFileSyncStub.returns(content);

      expect(() => readApiVersions()).to.throw(
        `api-versions.txt lists ${repeated} more than once`
      );
    });
  });
});

describe("committed api-versions.txt", () => {
  it("maps every API to a bundle location exactly once", () => {
    const apis = readApiVersions();
    expect(apis.length).to.be.greaterThan(0);
    expect(new Set(apis.map(({ apiName }) => apiName)).size).to.equal(
      apis.length
    );
    expect(new Set(apis.map(({ bundlePath }) => bundlePath)).size).to.equal(
      apis.length
    );
  });

  it("names the ECOM release the specs come from", () => {
    expect(
      parseEcomVersion(fs.readFileSync(API_VERSIONS_FILE, "utf-8"))
    ).to.match(/^\d+\.\d+$/);
  });
});

describe("parseEcomVersion", () => {
  it("extracts the release from the header", () => {
    expect(
      parseEcomVersion("# APIs for ECOM v26.11\nfoo-oas-v1=1.0.0")
    ).to.equal("26.11");
  });

  it("throws when the header is missing", () => {
    expect(() => parseEcomVersion("foo-oas-v1=1.0.0")).to.throw(
      'missing the "# APIs for ECOM vXX.Y" header'
    );
  });
});

describe("ecomRefForVersion", () => {
  it("maps a release to its branch", () => {
    expect(ecomRefForVersion("27.1")).to.equal("release.27.1");
  });
});

describe("parseEcomVersionArg", () => {
  it("reads the space-separated form", () => {
    expect(parseEcomVersionArg(["--ecom-version", "27.1"])).to.equal("27.1");
  });

  it("reads the equals form", () => {
    expect(parseEcomVersionArg(["--ecom-version=27.2"])).to.equal("27.2");
  });

  it("returns undefined when the flag is absent", () => {
    expect(parseEcomVersionArg(["--other", "x"])).to.be.undefined;
  });

  ["27", "v27.1", "27.1.0", "master"].forEach((value) => {
    it(`rejects the malformed version ${value}`, () => {
      expect(() => parseEcomVersionArg(["--ecom-version", value])).to.throw(
        "must look like 27.1"
      );
    });
  });

  it("rejects a flag with no value", () => {
    expect(() => parseEcomVersionArg(["--ecom-version"])).to.throw(
      "must look like 27.1"
    );
  });
});

describe("setEcomVersionHeader", () => {
  it("replaces the version and keeps every other line", () => {
    const before = "# APIs for ECOM v26.9\n# note\nfoo-oas-v1=1.0.0\n";
    expect(setEcomVersionHeader(before, "27.1")).to.equal(
      "# APIs for ECOM v27.1\n# note\nfoo-oas-v1=1.0.0\n"
    );
  });

  it("keeps the line break when a blank line follows the header", () => {
    const before = "# APIs for ECOM v26.9\n\nfoo-oas-v1=1.0.0\n";
    expect(setEcomVersionHeader(before, "27.1")).to.equal(
      "# APIs for ECOM v27.1\n\nfoo-oas-v1=1.0.0\n"
    );
  });

  it("throws when the header is missing", () => {
    expect(() => setEcomVersionHeader("foo-oas-v1=1.0.0", "27.1")).to.throw(
      'missing the "# APIs for ECOM vXX.Y" header'
    );
  });
});

describe("parseSingleApiArgs", () => {
  it("returns undefined when neither flag is present", () => {
    expect(parseSingleApiArgs(["--ecom-version", "27.1"])).to.be.undefined;
  });

  it("reads one api and a ref in the space-separated form", () => {
    expect(
      parseSingleApiArgs([
        "--api",
        "shopper-baskets-oas-v1",
        "--ref",
        "my-branch",
      ])
    ).to.deep.equal({ apis: ["shopper-baskets-oas-v1"], ref: "my-branch" });
  });

  it("reads the equals form and repeated --api", () => {
    expect(
      parseSingleApiArgs([
        "--api=shopper-baskets-oas-v1",
        "--api",
        "shopper-baskets-oas-v2",
        "--ref=abc123",
      ])
    ).to.deep.equal({
      apis: ["shopper-baskets-oas-v1", "shopper-baskets-oas-v2"],
      ref: "abc123",
    });
  });

  it("rejects a repeated --ref instead of silently using the last one", () => {
    expect(() =>
      parseSingleApiArgs([
        "--api",
        "a-oas-v1",
        "--ref",
        "branch-a",
        "--ref",
        "branch-b",
      ])
    ).to.throw("--ref can be given only once");
  });

  it("rejects --api without --ref", () => {
    expect(() => parseSingleApiArgs(["--api", "a-oas-v1"])).to.throw(
      "--api requires --ref"
    );
  });

  it("rejects --ref without --api", () => {
    expect(() => parseSingleApiArgs(["--ref", "master"])).to.throw(
      "--ref requires at least one --api"
    );
  });

  it("rejects a flag with no value", () => {
    expect(() => parseSingleApiArgs(["--api", "--ref", "master"])).to.throw(
      "--api needs a value"
    );
    expect(() => parseSingleApiArgs(["--api", "a-oas-v1", "--ref"])).to.throw(
      "--ref needs a value"
    );
  });

  it("rejects combining with --ecom-version", () => {
    expect(() =>
      parseSingleApiArgs([
        "--api",
        "a-oas-v1",
        "--ref",
        "master",
        "--ecom-version",
        "27.1",
      ])
    ).to.throw("cannot be combined with --ecom-version");
  });
});

describe("rejectUnknownArgs", () => {
  [
    [],
    ["--ecom-version", "27.1"],
    ["--api", "a-oas-v1", "--api=b-oas-v1", "--ref", "my-branch"],
  ].forEach((argv) => {
    it(`accepts known flags and their values: ${JSON.stringify(argv)}`, () => {
      expect(() => rejectUnknownArgs(argv)).not.to.throw();
    });
  });

  [
    { argv: ["--apis", "a-oas-v1", "--ref", "my-branch"], bad: "--apis" },
    { argv: ["--ecom-verison", "27.1"], bad: "--ecom-verison" },
    { argv: ["a-oas-v1"], bad: "a-oas-v1" },
    { argv: ["--ref", "my-branch", "extra"], bad: "extra" },
  ].forEach(({ argv, bad }) => {
    it(`rejects a mistyped or stray argument so it cannot fall through to a full refresh: ${JSON.stringify(
      argv
    )}`, () => {
      expect(() => rejectUnknownArgs(argv)).to.throw(`Unknown argument ${bad}`);
    });
  });
});
