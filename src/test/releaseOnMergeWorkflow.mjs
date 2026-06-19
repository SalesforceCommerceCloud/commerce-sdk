/*
 * Copyright (c) 2026, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/*
 * Locks the load-bearing pure-logic surfaces of
 * `.github/workflows/release-on-merge.yml`: the head-ref regex that gates the
 * workflow, and the awk pipeline that extracts release notes from CHANGELOG.md.
 *
 * The test extracts each step's full `run: |` block straight from the YAML and
 * pipes it to `bash`, with the same env vars the runner sets. That way it
 * exercises the exact shell text the workflow ships — a regex weakened in the
 * YAML reflows the matches here too.
 *
 * Runs under `node --test`, same harness as packageExports.mjs: jest's runtime
 * doesn't observe the workflow's bash + awk.
 */

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const workflow = readFileSync(
  resolve(repoRoot, '.github', 'workflows', 'release-on-merge.yml'),
  'utf8',
);

function extractRunBlock(stepName) {
  const re = new RegExp(
    `name: ${stepName}[\\s\\S]+?run: \\|\\n([\\s\\S]+?)(?=\\n      -|\\n$)`,
  );
  const m = workflow.match(re);
  if (!m) throw new Error(`step '${stepName}' run block not found`);
  return m[1].replace(/^ {10}/gm, '');
}

const versionResolveScript = extractRunBlock('Resolve version and cross-check sources');
const notesExtractScript = extractRunBlock('Extract release notes from CHANGELOG');

function runScriptInSandbox(script, env) {
  const wrapped = `\
sandbox=$(mktemp -d)
cd "$sandbox"
printf '%s' "$_PKG_JSON" > package.json
printf '%s' "$_CHANGELOG" > CHANGELOG.md
export GITHUB_OUTPUT=$(mktemp)
${script}
ec=$?
echo "---OUTPUT---"
cat "$GITHUB_OUTPUT"
exit $ec
`;
  const result = {ok: false, stdout: '', output: ''};
  try {
    result.stdout = execFileSync('bash', ['-c', wrapped], {
      env: {...process.env, ...env},
      stdio: ['pipe', 'pipe', 'pipe'],
    }).toString();
    result.ok = true;
  } catch (err) {
    result.stdout = (err.stdout?.toString() ?? '') + (err.stderr?.toString() ?? '');
  }
  const parts = result.stdout.split('---OUTPUT---');
  result.output = (parts[1] ?? '').trim();
  result.stdout = parts[0];
  return result;
}

function runVersionResolve({headRef, packageJson, changelog}) {
  const r = runScriptInSandbox(versionResolveScript, {
    HEAD_REF: headRef,
    _PKG_JSON: packageJson,
    _CHANGELOG: changelog,
  });
  if (!r.ok) return {ok: false, log: r.stdout};
  const match = r.output.match(/^version=(.+)$/m);
  return {ok: true, version: match ? match[1] : null};
}

function runNotesExtract({version, changelog}) {
  const r = runScriptInSandbox(notesExtractScript, {
    VER: version,
    _PKG_JSON: '{}',
    _CHANGELOG: changelog,
  });
  if (!r.ok) return {ok: false, log: r.stdout};
  const match = r.output.match(/notes<<(\S+)\n([\s\S]*?)\n\1/);
  return {ok: true, notes: match ? match[2] : ''};
}

const goodPackageJson = JSON.stringify({version: '5.3.0'});
const goodChangelog = `# CHANGELOG

## v5.3.0

### Enhancements

- Added a thing.
`;

test('version resolution accepts the canonical release-vX.Y.Z branch', () => {
  const r = runVersionResolve({
    headRef: 'release/v5.3.0',
    packageJson: goodPackageJson,
    changelog: goodChangelog,
  });
  assert.equal(r.ok, true, r.log);
  assert.equal(r.version, 'v5.3.0');
});

test('version resolution rejects a release branch missing the v prefix', () => {
  const r = runVersionResolve({
    headRef: 'release/5.3.0',
    packageJson: goodPackageJson,
    changelog: goodChangelog,
  });
  assert.equal(r.ok, false);
  assert.match(r.log, /Branch name does not match release format/);
});

test('version resolution rejects pre-release semver suffixes in the branch', () => {
  const r = runVersionResolve({
    headRef: 'release/v5.3.0-rc.1',
    packageJson: goodPackageJson,
    changelog: goodChangelog,
  });
  assert.equal(r.ok, false);
  assert.match(r.log, /Branch name does not match release format/);
});

test('version resolution rejects a release branch with a trailing path segment', () => {
  const r = runVersionResolve({
    headRef: 'release/v5.3.0/foo',
    packageJson: goodPackageJson,
    changelog: goodChangelog,
  });
  assert.equal(r.ok, false);
  assert.match(r.log, /Branch name does not match release format/);
});

test('version resolution rejects truncated semver in the branch', () => {
  const r = runVersionResolve({
    headRef: 'release/v5.3',
    packageJson: goodPackageJson,
    changelog: goodChangelog,
  });
  assert.equal(r.ok, false);
  assert.match(r.log, /Branch name does not match release format/);
});

test('version resolution rejects the legacy date-suffix branch format', () => {
  const r = runVersionResolve({
    headRef: 'release/20260119',
    packageJson: goodPackageJson,
    changelog: goodChangelog,
  });
  assert.equal(r.ok, false);
  assert.match(r.log, /Branch name does not match release format/);
});

test('version resolution rejects a same-day re-cut suffix', () => {
  const r = runVersionResolve({
    headRef: 'release/v5.3.0-2',
    packageJson: goodPackageJson,
    changelog: goodChangelog,
  });
  assert.equal(r.ok, false);
  assert.match(r.log, /Branch name does not match release format/);
});

test('version resolution rejects a non-release branch name', () => {
  const r = runVersionResolve({
    headRef: 'ju/something-W-12345678',
    packageJson: goodPackageJson,
    changelog: goodChangelog,
  });
  assert.equal(r.ok, false);
  assert.match(r.log, /Branch name does not match release format/);
});

test('version resolution fails when package.json disagrees with the branch', () => {
  const r = runVersionResolve({
    headRef: 'release/v5.3.0',
    packageJson: JSON.stringify({version: '5.4.0'}),
    changelog: goodChangelog,
  });
  assert.equal(r.ok, false);
  assert.match(r.log, /Version mismatch across sources/);
});

test('version resolution fails when CHANGELOG.md disagrees with the branch', () => {
  const r = runVersionResolve({
    headRef: 'release/v5.3.0',
    packageJson: goodPackageJson,
    changelog: '# CHANGELOG\n\n## v5.4.0\n\n- Different.\n',
  });
  assert.equal(r.ok, false);
  assert.match(r.log, /Version mismatch across sources/);
});

const multiVersionChangelog = `# CHANGELOG

## v5.4.0

### Enhancements

- Added support for thing X.

## v5.3.0

_ECOM v26.6_

### Enhancements

- Added shopper availability.

## v5.2.1

### Enhancements

- Patch fix.
`;

test('notes extraction returns only the top version section', () => {
  const r = runNotesExtract({version: 'v5.4.0', changelog: multiVersionChangelog});
  assert.equal(r.ok, true);
  assert.equal(r.notes, '### Enhancements\n\n- Added support for thing X.');
});

test('notes extraction returns a middle version section', () => {
  const r = runNotesExtract({version: 'v5.3.0', changelog: multiVersionChangelog});
  assert.equal(r.ok, true);
  assert.equal(
    r.notes,
    '_ECOM v26.6_\n\n### Enhancements\n\n- Added shopper availability.',
  );
});

test('notes extraction fails when the version is not in CHANGELOG.md', () => {
  const r = runNotesExtract({version: 'v9.9.9', changelog: multiVersionChangelog});
  assert.equal(r.ok, false);
  assert.match(r.log, /No CHANGELOG section found for v9\.9\.9/);
});

test('notes extraction trims surrounding blank lines', () => {
  const padded = `# CHANGELOG

## v1.0.0



- One bullet.



## v0.9.0

- Older.
`;
  const r = runNotesExtract({version: 'v1.0.0', changelog: padded});
  assert.equal(r.ok, true);
  assert.equal(r.notes, '- One bullet.');
});
