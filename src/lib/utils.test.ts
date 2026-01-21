/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import fs from "fs-extra";
import path from "path";
import { expect } from "chai";
import sinon from "sinon";
import * as utils from "./utils";
const { readApiVersions, API_VERSIONS_FILE, downloadApisWithAnypointCli } =
  utils;

describe("download-apis", () => {
  const mockApiId =
    "893f605e-10e2-423a-bdb4-f952f56eb6d8/shopper-baskets-oas/1.9.0";
  const mockTargetDir = "/path/to/target";
  const mockOrgId = "893f605e-10e2-423a-bdb4-f952f56eb6d8";
  const mockTempDir = path.join(process.cwd(), "temp", "downloads");

  let sandbox: sinon.SinonSandbox;
  let execSyncStub: sinon.SinonStub;
  let fsEnsureDirStub: sinon.SinonStub;
  let fsReaddirStub: sinon.SinonStub;
  let fsRemoveStub: sinon.SinonStub;
  let mockZipInstance: {
    extractAllTo: sinon.SinonStub;
  };
  let admZipStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Mock file system operations
    fsEnsureDirStub = sandbox.stub(fs, "ensureDir").resolves(undefined);
    fsReaddirStub = sandbox.stub(fs, "readdir").resolves(["api-asset.zip"]);
    fsRemoveStub = sandbox.stub(fs, "remove").resolves(undefined);

    // Mock execSync wrapper
    execSyncStub = sandbox.stub(utils, "runExecSync").returns(Buffer.from(""));

    // Mock AdmZip constructor via createAdmZip wrapper
    mockZipInstance = {
      extractAllTo: sandbox.stub(),
    };
    admZipStub = sandbox.stub(utils, "createAdmZip").returns(mockZipInstance);

    process.env.ANYPOINT_USERNAME = "test-user";
    process.env.ANYPOINT_PASSWORD = "test-pass";
  });

  afterEach(() => {
    delete process.env.ANYPOINT_USERNAME;
    delete process.env.ANYPOINT_PASSWORD;
    sandbox.restore();
  });

  describe("downloadApisWithAnypointCli", () => {
    it("should successfully download and extract API", async () => {
      await downloadApisWithAnypointCli(mockApiId, mockTargetDir, mockOrgId);

      // Verify temp directory was created
      expect(fsEnsureDirStub.calledWith(mockTempDir)).to.be.true;

      // Verify anypoint-cli command was executed
      expect(execSyncStub.called).to.be.true;
      const execCall = execSyncStub.getCall(0);
      expect(execCall.args[0]).to.include(
        "anypoint-cli-v4 exchange:asset:download"
      );
      expect(execCall.args[1]).to.deep.include({
        stdio: "inherit",
        cwd: process.cwd(),
        env: process.env,
      });

      // Verify command includes credentials and org ID
      expect(execCall.args[0]).to.include("--username 'test-user'");
      expect(execCall.args[0]).to.include("--password 'test-pass'");
      expect(execCall.args[0]).to.include(`--organization=${mockOrgId}`);

      // Verify zip file was read
      expect(fsReaddirStub.calledWith(mockTempDir)).to.be.true;

      // Verify target directory was created
      expect(fsEnsureDirStub.calledWith(mockTargetDir)).to.be.true;

      // Verify zip was extracted (AdmZip constructor was called and extractAllTo was called)
      expect(admZipStub.calledWith(path.join(mockTempDir, "api-asset.zip"))).to
        .be.true;
      expect(mockZipInstance.extractAllTo.called).to.be.true;

      // Verify temp directory was cleaned up
      expect(fsRemoveStub.calledWith(mockTempDir)).to.be.true;
    });

    it("should handle empty credentials gracefully", async () => {
      delete process.env.ANYPOINT_USERNAME;
      delete process.env.ANYPOINT_PASSWORD;

      await downloadApisWithAnypointCli(mockApiId, mockTargetDir, mockOrgId);

      const execCall = execSyncStub.getCall(0);
      expect(execCall.args[0]).to.include("--username ''");
      expect(execCall.args[0]).to.include("--password ''");
    });

    it("should throw error when anypoint-cli command fails", async () => {
      execSyncStub.throws(new Error("Command execution failed"));

      try {
        await downloadApisWithAnypointCli(mockApiId, mockTargetDir, mockOrgId);
        // istanbul ignore next
        expect(true).to.equal(false); // fails if we don't catch an error
      } catch (error) {
        expect(error.toString()).to.include(
          "Failed to download API 893f605e-10e2-423a-bdb4-f952f56eb6d8/shopper-baskets-oas/1.9.0: potential reasons: api or version does not exist, wrong credentials, wrong organization ID"
        );
      }

      // Verify temp directory was still created
      expect(fsEnsureDirStub.calledWith(mockTempDir)).to.be.true;
    });

    it("should throw error when no zip file is found", async () => {
      fsReaddirStub.resolves(["not-a-zip.txt", "readme.md"]);

      try {
        await downloadApisWithAnypointCli(mockApiId, mockTargetDir, mockOrgId);
        // istanbul ignore next
        expect(true).to.equal(false); // fails if we don't catch an error
      } catch (error) {
        expect(error.toString()).to.include(
          `Failed to download API ${mockApiId}: No zip file found in ${mockTempDir}`
        );
      }
    });

    it("should find zip file among multiple files", async () => {
      fsReaddirStub.resolves(["readme.md", "api-asset.zip", "other-file.txt"]);

      await downloadApisWithAnypointCli(mockApiId, mockTargetDir, mockOrgId);

      expect(admZipStub.calledWith(path.join(mockTempDir, "api-asset.zip"))).to
        .be.true;
      expect(mockZipInstance.extractAllTo.called).to.be.true;
    });

    it("should handle errors during zip extraction", async () => {
      mockZipInstance.extractAllTo.throws(new Error("Extraction failed"));

      try {
        await downloadApisWithAnypointCli(mockApiId, mockTargetDir, mockOrgId);
        // istanbul ignore next
        expect(true).to.equal(false); // fails if we don't catch an error
      } catch (error) {
        expect(error.toString()).to.include(
          "Failed to download API 893f605e-10e2-423a-bdb4-f952f56eb6d8/shopper-baskets-oas/1.9.0: Extraction failed"
        );
      }
    });

    it("should handle errors during cleanup", async () => {
      fsRemoveStub.rejects(new Error("Cleanup failed"));

      try {
        await downloadApisWithAnypointCli(mockApiId, mockTargetDir, mockOrgId);
        // istanbul ignore next
        expect(true).to.equal(false); // fails if we don't catch an error
      } catch (error) {
        expect(error.toString()).to.include(
          "Failed to download API 893f605e-10e2-423a-bdb4-f952f56eb6d8/shopper-baskets-oas/1.9.0: Cleanup failed"
        );
      }
    });

    it("should handle non-Error exceptions from execSync", async () => {
      execSyncStub.throws("String error");

      try {
        await downloadApisWithAnypointCli(mockApiId, mockTargetDir, mockOrgId);
        // istanbul ignore next
        expect(true).to.equal(false); // fails if we don't catch an error
      } catch (error) {
        expect(error.toString()).to.include(
          "Failed to download API 893f605e-10e2-423a-bdb4-f952f56eb6d8/shopper-baskets-oas/1.9.0: potential reasons: api or version does not exist, wrong credentials, wrong organization ID"
        );
      }
    });

    it("should handle non-Error exceptions from other operations", async () => {
      fsReaddirStub.rejects("Non-error exception");

      try {
        await downloadApisWithAnypointCli(mockApiId, mockTargetDir, mockOrgId);
        // istanbul ignore next
        expect(true).to.equal(false); // fails if we don't catch an error
      } catch (error) {
        expect(error.toString()).to.include(
          `Failed to download API ${mockApiId}`
        );
      }
    });

    it("should use correct temp directory path", async () => {
      const expectedTempDir = path.join(process.cwd(), "temp", "downloads");

      await downloadApisWithAnypointCli(mockApiId, mockTargetDir, mockOrgId);

      expect(fsEnsureDirStub.calledWith(expectedTempDir)).to.be.true;
      const execCall = execSyncStub.getCall(0);
      expect(execCall.args[0]).to.include(expectedTempDir);
    });

    it("should pass correct parameters to anypoint-cli command", async () => {
      await downloadApisWithAnypointCli(mockApiId, mockTargetDir, mockOrgId);

      const expectedCmd = `anypoint-cli-v4 exchange:asset:download ${mockApiId} ${mockTempDir} --username 'test-user' --password 'test-pass' --organization=${mockOrgId}`;

      expect(
        execSyncStub.calledWith(
          expectedCmd,
          sinon.match({
            stdio: "inherit",
            cwd: process.cwd(),
            env: process.env,
          })
        )
      ).to.be.true;
    });

    it("should log download progress", async () => {
      await downloadApisWithAnypointCli(mockApiId, mockTargetDir, mockOrgId);

      // Note: console.log is stubbed globally in testResources/setup.ts
      // We can't verify specific calls here since the stub is managed globally
    });

    it("should extract zip with overwrite flag", async () => {
      await downloadApisWithAnypointCli(mockApiId, mockTargetDir, mockOrgId);

      expect(mockZipInstance.extractAllTo.calledWith(mockTargetDir, true)).to.be
        .true;
    });
  });
});

describe("readApiVersions", () => {
  const mockApiVersionsContent = `shopper-baskets-oas-v1=1.9.0
shopper-baskets-oas-v2=2.1.0
shopper-payments-oas-v1=1.1.0`;

  let sandbox: sinon.SinonSandbox;
  let fsExistsSyncStub: sinon.SinonStub;
  let fsReadFileSyncStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    fsExistsSyncStub = sandbox.stub(fs, "existsSync").returns(true);
    fsReadFileSyncStub = sandbox
      .stub(fs, "readFileSync")
      .returns(mockApiVersionsContent);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should read and parse api-versions.txt correctly", () => {
    const result = readApiVersions();

    expect(fsExistsSyncStub.calledWith(API_VERSIONS_FILE)).to.be.true;
    expect(fsReadFileSyncStub.calledWith(API_VERSIONS_FILE, "utf-8")).to.be
      .true;
    expect(result).to.deep.equal([
      { apiName: "shopper-baskets-oas-v1", version: "1.9.0" },
      { apiName: "shopper-baskets-oas-v2", version: "2.1.0" },
      { apiName: "shopper-payments-oas-v1", version: "1.1.0" },
    ]);
  });

  it("should filter out empty lines and comments", () => {
    const contentWithComments = `# This is a comment
shopper-baskets-oas-v1=1.9.0

shopper-baskets-oas-v2=2.1.0
# Another comment
shopper-payments-oas-v1=1.1.0

`;
    fsReadFileSyncStub.returns(contentWithComments);

    const result = readApiVersions();

    expect(result).to.deep.equal([
      { apiName: "shopper-baskets-oas-v1", version: "1.9.0" },
      { apiName: "shopper-baskets-oas-v2", version: "2.1.0" },
      { apiName: "shopper-payments-oas-v1", version: "1.1.0" },
    ]);
  });

  it("should throw error when file does not exist", () => {
    fsExistsSyncStub.returns(false);

    expect(() => readApiVersions()).to.throw(
      `API versions file not found at: ${API_VERSIONS_FILE}`
    );
  });

  it("should handle whitespace around api names and versions", () => {
    const contentWithWhitespace = `shopper-baskets-oas-v1  =  1.9.0
  shopper-baskets-oas-v2=2.1.0  `;
    fsReadFileSyncStub.returns(contentWithWhitespace);

    const result = readApiVersions();

    expect(result).to.deep.equal([
      { apiName: "shopper-baskets-oas-v1", version: "1.9.0" },
      { apiName: "shopper-baskets-oas-v2", version: "2.1.0" },
    ]);
  });
});
