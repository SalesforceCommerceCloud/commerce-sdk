/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { execFileSync } from "child_process";
import crypto from "crypto";
import os from "os";
import path from "path";
import fs from "fs-extra";
import { expect } from "chai";
import sinon from "sinon";
import {
  BundledApi,
  fetchEcomBundles,
  findApiFolders,
  getEcomBundlesRoot,
  loadBundledApi,
  replaceApis,
  resolveEcomOasRef,
  stageApi,
} from "./ecomOas";

const ENV_KEYS = ["ECOM_OAS_REF", "ECOM_REPO_URL", "ECOM_BUNDLES_ROOT"];

const makeTempDir = (prefix: string): string =>
  fs.mkdtempSync(path.join(os.tmpdir(), prefix));

const writeDescriptor = (
  apisDir: string,
  name: string,
  assetId: string,
  apiVersion: string
): void => {
  fs.ensureDirSync(path.join(apisDir, name));
  fs.writeJSONSync(path.join(apisDir, name, "exchange.json"), {
    assetId,
    apiVersion,
  });
};

describe("ecomOas", () => {
  // A private sandbox: sinon.restore() would also undo spies other test files
  // create at load time.
  const sandbox = sinon.createSandbox();
  beforeEach(() => {
    const env = { ...process.env };
    ENV_KEYS.forEach((key) => delete env[key]);
    sandbox.stub(process, "env").value(env);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("resolveEcomOasRef", () => {
    beforeEach(() => {
      sandbox
        .stub(fs, "readFileSync")
        .returns("# APIs for ECOM v26.9\nfoo-oas-v1=shopper/foo/foo/v1");
    });

    it("uses the release in the api-versions header by default", () => {
      expect(resolveEcomOasRef()).to.equal("release.26.9");
    });

    it("prefers an explicit version over the header", () => {
      expect(resolveEcomOasRef("27.1")).to.equal("release.27.1");
    });

    it("prefers ECOM_OAS_REF over both", () => {
      process.env.ECOM_OAS_REF = " master ";
      expect(resolveEcomOasRef("27.1")).to.equal("master");
    });
  });

  describe("getEcomBundlesRoot", () => {
    it("trims whitespace and trailing slashes so sparse-checkout paths join cleanly", () => {
      process.env.ECOM_BUNDLES_ROOT = " some/bundles//\n";
      expect(getEcomBundlesRoot()).to.equal("some/bundles");
    });

    it("fails with a pointer to the docs when unset", () => {
      expect(() => getEcomBundlesRoot()).to.throw(
        "ECOM_BUNDLES_ROOT is not set"
      );
    });
  });

  describe("findApiFolders", () => {
    let apisDir: string;

    beforeEach(() => {
      apisDir = makeTempDir("apis-");
    });

    afterEach(() => {
      fs.removeSync(apisDir);
    });

    it("matches by assetId and apiVersion, not by folder name", () => {
      writeDescriptor(
        apisDir,
        "shopper-baskets-oas-1.9.0",
        "shopper-baskets-oas",
        "v1"
      );
      writeDescriptor(
        apisDir,
        "shopper-baskets-oas-2.1.0",
        "shopper-baskets-oas",
        "v2"
      );
      writeDescriptor(
        apisDir,
        "shopper-orders-oas-1.1.0",
        "shopper-orders-oas",
        "v1"
      );

      expect(findApiFolders(apisDir, "shopper-baskets-oas-v1")).to.deep.equal([
        path.join(apisDir, "shopper-baskets-oas-1.9.0"),
      ]);
    });

    it("returns nothing when the API has no folder yet", () => {
      writeDescriptor(
        apisDir,
        "shopper-orders-oas-1.1.0",
        "shopper-orders-oas",
        "v1"
      );
      expect(findApiFolders(apisDir, "shopper-baskets-oas-v1")).to.deep.equal(
        []
      );
    });

    it("ignores folders without an exchange.json", () => {
      fs.ensureDirSync(path.join(apisDir, "stray"));
      expect(findApiFolders(apisDir, "shopper-baskets-oas-v1")).to.deep.equal(
        []
      );
    });

    it("returns nothing when the apis directory does not exist", () => {
      expect(
        findApiFolders(path.join(apisDir, "missing"), "a-oas-v1")
      ).to.deep.equal([]);
    });
  });

  describe("loadBundledApi", () => {
    let bundlesRoot: string;
    const bundlePath = "admin/pricing/coupons/v1";
    const publicFile = "coupons-oas-v1-public-1.0.44-current.yaml";
    const specText = "openapi: 3.0.3\ninfo:\n  title: Coupons\n";

    const writeBundle = (manifestOverrides: Record<string, unknown> = {}) => {
      const dir = path.join(bundlesRoot, bundlePath);
      fs.ensureDirSync(dir);
      fs.writeFileSync(path.join(dir, publicFile), specText);
      fs.writeJSONSync(path.join(dir, "manifest.json"), {
        apiName: "coupons",
        apiVersion: "v1",
        schemaVersion: "1.0.44",
        internalOnly: false,
        artifacts: {
          public: {
            path: `${bundlePath}/${publicFile}`,
            sha256: crypto.createHash("sha256").update(specText).digest("hex"),
          },
        },
        ...manifestOverrides,
      });
    };

    beforeEach(() => {
      bundlesRoot = makeTempDir("bundles-");
    });

    afterEach(() => {
      fs.removeSync(bundlesRoot);
    });

    it("describes the public bundle from its manifest", () => {
      writeBundle();

      expect(
        loadBundledApi(bundlesRoot, "coupons-oas-v1", bundlePath)
      ).to.deep.equal({
        assetId: "coupons-oas",
        apiVersion: "v1",
        version: "1.0.44",
        name: "Coupons OAS",
        publicSpec: path.join(bundlesRoot, bundlePath, publicFile),
      });
    });

    it("title-cases multi-word API names the way Exchange did", () => {
      writeBundle({ apiName: "source-code-groups" });

      expect(
        loadBundledApi(bundlesRoot, "source-code-groups-oas-v1", bundlePath)
          .name
      ).to.equal("Source Code Groups OAS");
    });

    it("fails when the ref has no bundle at that location", () => {
      expect(() =>
        loadBundledApi(bundlesRoot, "coupons-oas-v1", bundlePath)
      ).to.throw(`No bundle manifest for coupons-oas-v1 at ${bundlePath}`);
    });

    it("fails when the manifest names a different API", () => {
      writeBundle({ apiName: "promotions" });

      expect(() =>
        loadBundledApi(bundlesRoot, "coupons-oas-v1", bundlePath)
      ).to.throw("describes promotions-oas-v1");
    });

    it("refuses an internal-only API", () => {
      writeBundle({ internalOnly: true, artifacts: {} });

      expect(() =>
        loadBundledApi(bundlesRoot, "coupons-oas-v1", bundlePath)
      ).to.throw("internal-only");
    });

    [
      ["another directory", `admin/pricing/promotions/v1/${publicFile}`],
      [
        "a parent-directory segment",
        `${bundlePath}/../../promotions/v1/${publicFile}`,
      ],
    ].forEach(([label, artifactPath]) => {
      it(`refuses an artifact path outside the API's own bundle directory: ${label}`, () => {
        writeBundle({
          artifacts: { public: { path: artifactPath, sha256: "x" } },
        });

        expect(() =>
          loadBundledApi(bundlesRoot, "coupons-oas-v1", bundlePath)
        ).to.throw(`outside ${bundlePath}`);
      });
    });

    it("refuses a schema version that is not semantic", () => {
      writeBundle({ schemaVersion: undefined });

      expect(() =>
        loadBundledApi(bundlesRoot, "coupons-oas-v1", bundlePath)
      ).to.throw("schema version");
    });

    it("fails when the public bundle does not match its recorded hash", () => {
      writeBundle();
      fs.appendFileSync(path.join(bundlesRoot, bundlePath, publicFile), "x");

      expect(() =>
        loadBundledApi(bundlesRoot, "coupons-oas-v1", bundlePath)
      ).to.throw("does not match the SHA-256");
    });
  });

  describe("stageApi", () => {
    let workDir: string;

    beforeEach(() => {
      workDir = makeTempDir("stage-");
    });

    afterEach(() => {
      fs.removeSync(workDir);
    });

    it("writes the bundle without ECOM's leading build comments, and the descriptor the generator reads", () => {
      const publicSpec = path.join(workDir, "source.yaml");
      fs.writeFileSync(
        publicSpec,
        "# GENERATED FILE\n# Source: internal/path.yaml\nopenapi: 3.0.3\n# kept\n"
      );
      const api: BundledApi = {
        assetId: "shopper-baskets-oas",
        apiVersion: "v2",
        version: "2.13.4",
        name: "Shopper Baskets OAS",
        publicSpec,
      };
      const stagedDir = path.join(workDir, "staged");

      const folderName = stageApi(api, stagedDir, "master", "a".repeat(40));

      expect(folderName).to.equal("shopper-baskets-oas-2.13.4");
      const folder = path.join(stagedDir, folderName);
      expect(
        fs.readFileSync(
          path.join(folder, "shopper-baskets-oas-v2-public.yaml"),
          "utf-8"
        )
      ).to.equal("openapi: 3.0.3\n# kept\n");
      expect(fs.readJSONSync(path.join(folder, "exchange.json"))).to.deep.equal(
        {
          main: "shopper-baskets-oas-v2-public.yaml",
          name: "Shopper Baskets OAS",
          assetId: "shopper-baskets-oas",
          version: "2.13.4",
          classifier: "oas",
          apiVersion: "v2",
          ecomRef: "master",
          ecomCommit: "a".repeat(40),
        }
      );
    });
  });

  describe("replaceApis", () => {
    let workDir: string;
    let stagedDir: string;
    let apisDir: string;
    let backupDir: string;

    beforeEach(() => {
      workDir = makeTempDir("replace-");
      stagedDir = path.join(workDir, "staged");
      apisDir = path.join(workDir, "apis");
      backupDir = path.join(workDir, "oldApis");
      writeDescriptor(apisDir, "coupons-oas-1.0.43", "coupons-oas", "v1");
      writeDescriptor(apisDir, "orders-oas-1.6.4", "orders-oas", "v1");
      writeDescriptor(stagedDir, "coupons-oas-1.0.44", "coupons-oas", "v1");
    });

    afterEach(() => {
      fs.removeSync(workDir);
    });

    it("partial update swaps only the named API's folder", () => {
      replaceApis({ stagedDir, apisDir, backupDir, keys: ["coupons-oas-v1"] });

      expect(fs.readdirSync(apisDir).sort()).to.deep.equal([
        "coupons-oas-1.0.44",
        "orders-oas-1.6.4",
      ]);
    });

    it("full refresh leaves only what was staged", () => {
      replaceApis({ stagedDir, apisDir, backupDir });

      expect(fs.readdirSync(apisDir)).to.deep.equal(["coupons-oas-1.0.44"]);
    });

    it("keeps the previous apis/ in the backup for diffApis", () => {
      replaceApis({ stagedDir, apisDir, backupDir });

      expect(fs.readdirSync(backupDir).sort()).to.deep.equal([
        "coupons-oas-1.0.43",
        "orders-oas-1.6.4",
      ]);
    });

    it("restores apis/ when copying the staged APIs fails", () => {
      const realCopySync = fs.copySync.bind(fs);
      // The first copy is the backup; the second is staged -> apis/.
      sandbox
        .stub(fs, "copySync")
        .callsFake(realCopySync)
        .onSecondCall()
        .throws(new Error("disk full"));
      sandbox.stub(console, "error");

      expect(() => replaceApis({ stagedDir, apisDir, backupDir })).to.throw(
        "disk full"
      );
      expect(fs.readdirSync(apisDir).sort()).to.deep.equal([
        "coupons-oas-1.0.43",
        "orders-oas-1.6.4",
      ]);
    });
  });

  describe("fetchEcomBundles", () => {
    let workDir: string;
    let originDir: string;
    let checkoutDir: string;
    let commit: string;

    const git = (cwd: string, ...args: string[]): string =>
      execFileSync("git", args, { cwd, stdio: "pipe" }).toString().trim();

    beforeEach(() => {
      workDir = makeTempDir("ecom-fetch-");
      originDir = path.join(workDir, "origin");
      checkoutDir = path.join(workDir, "checkout");
      ["admin/pricing/coupons/v1", "admin/checkout/orders/v1"].forEach(
        (bundlePath) => {
          const dir = path.join(originDir, "bundles", bundlePath);
          fs.ensureDirSync(dir);
          fs.writeJSONSync(path.join(dir, "manifest.json"), { bundlePath });
        }
      );
      git(originDir, "init", "-q", "-b", "main");
      // The fetch asks for a partial clone, which the serving side must allow.
      git(originDir, "config", "uploadpack.allowFilter", "true");
      git(originDir, "add", ".");
      git(
        originDir,
        "-c",
        "user.name=test",
        "-c",
        "user.email=test@example.com",
        "-c",
        "commit.gpgsign=false",
        "commit",
        "-q",
        "-m",
        "bundles"
      );
      commit = git(originDir, "rev-parse", "HEAD");
      process.env.ECOM_REPO_URL = `file://${originDir}`;
      process.env.ECOM_BUNDLES_ROOT = "bundles";
    });

    afterEach(() => {
      fs.removeSync(workDir);
    });

    it("checks out only the requested bundles and reports the commit", () => {
      const fetched = fetchEcomBundles(checkoutDir, "main", [
        "admin/pricing/coupons/v1",
      ]);

      expect(fetched).to.deep.equal({
        bundlesPath: path.join(checkoutDir, "bundles"),
        commit,
      });
      expect(commit).to.match(/^[0-9a-f]{40}$/);
      expect(
        fs.existsSync(
          path.join(
            fetched.bundlesPath,
            "admin/pricing/coupons/v1/manifest.json"
          )
        )
      ).to.be.true;
      expect(fs.existsSync(path.join(fetched.bundlesPath, "admin/checkout"))).to
        .be.false;
    });

    it("fails with guidance when the ref does not exist", () => {
      expect(() =>
        fetchEcomBundles(checkoutDir, "release.99.9", [
          "admin/pricing/coupons/v1",
        ])
      ).to.throw("Could not fetch release.99.9 from ECOM");
    });

    it("fails when the ref carries none of the bundles", () => {
      process.env.ECOM_BUNDLES_ROOT = "not-bundles";

      expect(() =>
        fetchEcomBundles(checkoutDir, "main", ["admin/pricing/coupons/v1"])
      ).to.throw("has none of the requested bundles");
    });
  });
});
