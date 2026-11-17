/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import crypto from "crypto";
import { execFileSync } from "child_process";
import path from "path";
import fs from "fs-extra";
import { API_VERSIONS_FILE } from "./config";
import {
  ecomRefForVersion,
  parseEcomVersion,
  readApiFolderIdentity,
} from "./utils";

/**
 * ECOM is the source of truth for SCAPI OAS definitions. Its build publishes one
 * bundled, self-contained spec per API into a bundles directory in git, next to a
 * `manifest.json` that records the API's identity, schema version and SHA-256. This
 * module fetches only the bundles the SDK ships and reshapes each into the on-disk
 * form the generator consumes - `apis/<assetId>-<version>/` holding just the public
 * bundle, whose file name carries the API's id and major version.
 *
 * We consume ECOM's public bundle rather than bundling the authoring sources
 * ourselves: the public view is produced by ECOM's own Redocly config and
 * decorators, which strip internal-only content and resolve description
 * placeholders.
 */

/**
 * Where the specs live is supplied by the environment rather than committed: this
 * repo is public and the ECOM remote is internal. Developers keep them in a local,
 * gitignored `.env`. Values are trimmed because a pasted credential URL commonly
 * carries a trailing newline that git rejects.
 * @param name - the environment variable to read
 * @returns the trimmed value
 */
function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `${name} is not set. It must point at the ECOM source; see ECOM_SPEC_CONTRACT.md.`
    );
  }
  return value;
}

/**
 * @returns the git remote URL of the ECOM monorepo
 */
export const getEcomRepoUrl = (): string => requireEnv("ECOM_REPO_URL");

/**
 * @returns the path of the SCAPI bundles directory inside the ECOM checkout
 */
export const getEcomBundlesRoot = (): string =>
  requireEnv("ECOM_BUNDLES_ROOT").replace(/\/+$/, "");

/**
 * Which ref to pull specs from, most specific first: `ECOM_OAS_REF` (e.g. "master"
 * for unreleased specs), then the explicit `ecomVersion`, then the ECOM version in
 * api-versions.txt. Release branches keep a given SDK release reproducible and
 * patchable.
 * @param ecomVersion - the release passed with `--ecom-version`, if any
 * @returns the ECOM git ref
 */
export function resolveEcomOasRef(ecomVersion?: string): string {
  const override = process.env.ECOM_OAS_REF?.trim();
  if (override) {
    return override;
  }
  return ecomRefForVersion(
    ecomVersion ?? parseEcomVersion(fs.readFileSync(API_VERSIONS_FILE, "utf-8"))
  );
}

export type FetchedBundles = {
  // Absolute path to the checked-out bundles root
  bundlesPath: string;
  // Full SHA of the ECOM commit the ref resolved to
  commit: string;
};

/**
 * Sparse, shallow-checks out only the given API bundle directories (relative to the
 * bundles root) from the ECOM monorepo into `targetDir`, at one ref.
 * @param targetDir - scratch directory for the checkout; emptied first
 * @param ref - branch, tag or full commit SHA
 * @param bundlePaths - `<type>/<family>/<api>/vN` locations to check out
 * @returns where the bundles landed and which commit they came from
 */
export function fetchEcomBundles(
  targetDir: string,
  ref: string,
  bundlePaths: string[]
): FetchedBundles {
  const repoUrl = getEcomRepoUrl();
  const bundlesRoot = getEcomBundlesRoot();
  fs.removeSync(targetDir);
  fs.ensureDirSync(targetDir);

  // Arguments are passed as an array, not a shell string, so a ref or URL can never
  // be split or interpreted by a shell.
  const git = (...args: string[]): string =>
    execFileSync("git", args, {
      cwd: targetDir,
      stdio: ["ignore", "pipe", "inherit"],
    }).toString();

  git("init", "-q");
  git("remote", "add", "origin", repoUrl);
  git(
    "sparse-checkout",
    "set",
    "--cone",
    ...bundlePaths.map((bundlePath) => `${bundlesRoot}/${bundlePath}`)
  );
  // blob:none downloads only the files the sparse checkout needs; a plain shallow
  // fetch would transfer every file in the monorepo at that commit. `--` stops a
  // ref that starts with a dash from being read as an option.
  try {
    git(
      "fetch",
      "-q",
      "--depth",
      "1",
      "--filter=blob:none",
      "origin",
      "--",
      ref
    );
  } catch {
    throw new Error(
      `Could not fetch ${ref} from ECOM (git output above). Check you can reach ECOM and that the branch, tag or full 40-character commit SHA exists; a release branch may not be cut yet.`
    );
  }
  git("checkout", "-q", "FETCH_HEAD");

  const bundlesPath = path.join(targetDir, bundlesRoot);
  if (!fs.existsSync(bundlesPath)) {
    throw new Error(
      `${ref} exists on ECOM but has none of the requested bundles under ECOM_BUNDLES_ROOT. Bundles are published by ECOM's build; the ref may predate them or not carry them yet.`
    );
  }
  return { bundlesPath, commit: git("rev-parse", "HEAD").trim() };
}

type BundleManifest = {
  apiName: string;
  apiVersion: string;
  schemaVersion?: string;
  internalOnly: boolean;
  artifacts?: { public?: { path: string; sha256: string } };
};

export type BundledApi = {
  // e.g. "shopper-baskets-oas"
  assetId: string;
  // e.g. "v1"
  apiVersion: string;
  // SemVer of the spec, e.g. "1.12.3"
  version: string;
  // Absolute path to ECOM's public bundle
  publicSpec: string;
};

/**
 * Reads the ECOM manifest at `<bundlesRoot>/<bundlePath>` and returns the public
 * bundle for the allow-list key `apiName` (e.g. "shopper-baskets-oas-v1").
 * @param bundlesRoot - absolute path to the checked-out bundles root
 * @param apiName - the api-versions.txt key
 * @param bundlePath - the key's `<type>/<family>/<api>/vN` location
 * @returns the API's identity and public bundle
 * @throws if the ref has no manifest there, the manifest describes a different API,
 * the API is internal-only, or the bundle does not match its recorded SHA-256
 */
export function loadBundledApi(
  bundlesRoot: string,
  apiName: string,
  bundlePath: string
): BundledApi {
  const manifestFile = path.join(bundlesRoot, bundlePath, "manifest.json");
  if (!fs.existsSync(manifestFile)) {
    throw new Error(`No bundle manifest for ${apiName} at ${bundlePath}`);
  }
  const manifest = fs.readJSONSync(manifestFile) as BundleManifest;

  const assetId = `${manifest.apiName}-oas`;
  const manifestKey = `${assetId}-${manifest.apiVersion}`;
  if (manifestKey !== apiName) {
    throw new Error(
      `${bundlePath} describes ${manifestKey}, not ${apiName}; fix its location in api-versions.txt`
    );
  }

  const artifact = manifest.artifacts?.public;
  if (manifest.internalOnly || !artifact) {
    throw new Error(
      `${apiName} is internal-only in ECOM and has no public bundle to ship`
    );
  }

  // Only the API's own directory is checked out, and the folder name in `apis/`
  // embeds the schema version, so both must be what the manifest claims.
  // Normalized first so a `..` segment cannot climb out of the API's directory.
  if (!path.posix.normalize(artifact.path).startsWith(`${bundlePath}/`)) {
    throw new Error(
      `${apiName}: manifest points its public bundle outside ${bundlePath}: ${artifact.path}`
    );
  }
  const { schemaVersion = "" } = manifest;
  if (!/^\d+\.\d+\.\d+$/.test(schemaVersion)) {
    throw new Error(
      `${apiName}: manifest has no semantic schema version, received "${schemaVersion}"`
    );
  }

  const publicSpec = path.join(bundlesRoot, artifact.path);
  const sha256 = crypto
    .createHash("sha256")
    .update(fs.readFileSync(publicSpec))
    .digest("hex");
  if (sha256 !== artifact.sha256) {
    throw new Error(
      `${artifact.path} does not match the SHA-256 in its manifest; ECOM's bundles are out of date at this ref`
    );
  }

  return {
    assetId,
    apiVersion: manifest.apiVersion,
    version: schemaVersion,
    publicSpec,
  };
}

const LEADING_COMMENT_LINES = /^(#[^\n]*\n)+/;

/**
 * Writes one API into `stagedDir` in the shape the generator reads: a
 * `<assetId>-<version>` folder holding the public bundle, named
 * `<assetId>-<apiVersion>-public.yaml`.
 * @param api - the bundle returned by loadBundledApi
 * @param stagedDir - the staging directory
 * @returns the folder name written
 */
export function stageApi(api: BundledApi, stagedDir: string): string {
  const folderName = `${api.assetId}-${api.version}`;
  const targetDir = path.join(stagedDir, folderName);
  fs.ensureDirSync(targetDir);
  // ECOM prefixes each bundle with a comment block naming its internal source file
  // and build command. This repo is public, so that block is dropped; the rest of the
  // file is copied unchanged.
  const spec = fs
    .readFileSync(api.publicSpec, "utf-8")
    .replace(LEADING_COMMENT_LINES, "");
  fs.writeFileSync(
    path.join(targetDir, `${api.assetId}-${api.apiVersion}-public.yaml`),
    spec
  );
  return folderName;
}

/**
 * Finds the folders in `apisDir` that belong to one allow-list key such as
 * `shopper-baskets-oas-v1`. Matches on the `assetId` and `apiVersion` in each
 * folder's spec file name rather than on the folder name: the name embeds the spec
 * version, which changes on every update, and v1 and v2 share an assetId.
 * @param apisDir - directory of generator-ready API folders
 * @param allowKey - the api-versions.txt key
 * @returns absolute paths of the matching folders
 */
export function findApiFolders(apisDir: string, allowKey: string): string[] {
  if (!fs.existsSync(apisDir)) {
    return [];
  }
  return fs
    .readdirSync(apisDir)
    .map((name) => path.join(apisDir, name))
    .filter((dir) => {
      const identity = readApiFolderIdentity(dir);
      return (
        identity !== undefined &&
        `${identity.assetId}-${identity.apiVersion}` === allowKey
      );
    });
}

export type ReplaceApisOptions = {
  stagedDir: string;
  apisDir: string;
  // Receives a copy of `apisDir` before it changes; `diffApis` compares against it
  backupDir: string;
  // Only these keys' folders are replaced; when omitted, `apisDir` is emptied first
  keys?: string[];
};

/**
 * Moves staged APIs into `apisDir`. A partial update removes only the named keys'
 * old folders (their names embed the old version, so they would otherwise linger
 * beside the new ones); a full refresh empties `apisDir`. If anything fails after
 * `apisDir` starts changing, it is restored from `backupDir` and the error rethrown.
 * @param options - see ReplaceApisOptions
 */
export function replaceApis({
  stagedDir,
  apisDir,
  backupDir,
  keys,
}: ReplaceApisOptions): void {
  fs.removeSync(backupDir);
  fs.ensureDirSync(apisDir);
  fs.copySync(apisDir, backupDir);

  try {
    if (keys) {
      keys.forEach((key) => {
        findApiFolders(apisDir, key).forEach((dir) => fs.removeSync(dir));
      });
    } else {
      fs.emptyDirSync(apisDir);
    }
    fs.copySync(stagedDir, apisDir);
  } catch (error) {
    console.error(`Restoring ${apisDir} from ${backupDir}...`);
    fs.removeSync(apisDir);
    fs.copySync(backupDir, apisDir);
    throw error;
  }
}
