/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { execSync } from "child_process";
import fs from "fs-extra";
import path from "path";
import AdmZip from "adm-zip";
import { expect } from "chai";
import sinon from "sinon";
import { downloadApisWithAnypointCli } from "./utils";

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
  let consoleLogStub: sinon.SinonStub;
  let consoleErrorStub: sinon.SinonStub;
  let admZipStub: sinon.SinonStub;
  let mockZipInstance: {
    extractAllTo: sinon.SinonStub;
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Mock console methods
    consoleLogStub = sandbox.stub(console, "log");
    consoleErrorStub = sandbox.stub(console, "error");

    // Mock file system operations
    fsEnsureDirStub = sandbox.stub(fs, "ensureDir").resolves(undefined);
    fsReaddirStub = sandbox.stub(fs, "readdir").resolves(["api-asset.zip"]);
    fsRemoveStub = sandbox.stub(fs, "remove").resolves(undefined);

    // Mock execSync
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const childProcess = require("child_process");
    execSyncStub = sandbox
      .stub(childProcess, "execSync")
      .returns(Buffer.from(""));

    // Mock AdmZip
    mockZipInstance = {
      extractAllTo: sandbox.stub(),
    };
    // Stub the AdmZip constructor on the module
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const admZipModule = require("adm-zip");
    admZipStub = sandbox
      .stub(admZipModule, "default")
      .callsFake(() => mockZipInstance);
    // If default doesn't work, try stubbing the module itself
    if (!admZipModule.default) {
      admZipStub = sandbox.stub(admZipModule).callsFake(() => mockZipInstance);
    }

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
      expect(fsEnsureDirStub).to.have.been.calledWith(mockTempDir);

      // Verify anypoint-cli command was executed
      expect(execSyncStub).to.have.been.called;
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
      expect(fsReaddirStub).to.have.been.calledWith(mockTempDir);

      // Verify target directory was created
      expect(fsEnsureDirStub).to.have.been.calledWith(mockTargetDir);

      // Verify zip was extracted
      expect(admZipStub).to.have.been.calledWith(
        path.join(mockTempDir, "api-asset.zip")
      );

      // Verify temp directory was cleaned up
      expect(fsRemoveStub).to.have.been.calledWith(mockTempDir);

      // eslint-disable-next-line no-console
      expect(consoleLogStub).to.have.been.calledWith(
        sinon.match.string.includes("Successfully downloaded and extracted")
      );
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
      expect(fsEnsureDirStub).to.have.been.calledWith(mockTempDir);
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

      expect(admZipStub).to.have.been.calledWith(
        path.join(mockTempDir, "api-asset.zip")
      );
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

      expect(fsEnsureDirStub).to.have.been.calledWith(expectedTempDir);
      const execCall = execSyncStub.getCall(0);
      expect(execCall.args[0]).to.include(expectedTempDir);
    });

    it("should pass correct parameters to anypoint-cli command", async () => {
      await downloadApisWithAnypointCli(mockApiId, mockTargetDir, mockOrgId);

      const expectedCmd = `anypoint-cli-v4 exchange:asset:download ${mockApiId} ${mockTempDir} --username 'test-user' --password 'test-pass' --organization=${mockOrgId}`;

      expect(execSyncStub).to.have.been.calledWith(
        expectedCmd,
        sinon.match({
          stdio: "inherit",
          cwd: process.cwd(),
          env: process.env,
        })
      );
    });

    it("should log download progress", async () => {
      await downloadApisWithAnypointCli(mockApiId, mockTargetDir, mockOrgId);

      // eslint-disable-next-line no-console
      expect(consoleLogStub).to.have.been.calledWith(
        `Downloading API ${mockApiId} using anypoint-cli...`
      );
      // eslint-disable-next-line no-console
      expect(consoleLogStub).to.have.been.calledWith(
        sinon.match.string.includes("Extracting api-asset.zip")
      );
      // eslint-disable-next-line no-console
      expect(consoleLogStub).to.have.been.calledWith(
        sinon.match.string.includes("Successfully downloaded and extracted")
      );
    });

    it("should extract zip with overwrite flag", async () => {
      await downloadApisWithAnypointCli(mockApiId, mockTargetDir, mockOrgId);

      expect(mockZipInstance.extractAllTo).to.have.been.calledWith(
        mockTargetDir,
        true
      );
    });
  });
});
