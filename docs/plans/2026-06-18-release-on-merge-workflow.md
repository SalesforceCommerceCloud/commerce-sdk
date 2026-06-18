# Plan: Port release-on-merge workflow to commerce-sdk

> For agentic workers: implement this plan task-by-task with
> red-green-refactor discipline. One task, one commit. Never batch.

---

## Frontmatter

| Field       | Value                                                   |
|-------------|---------------------------------------------------------|
| Name        | Port release-on-merge workflow from isomorphic PR #289  |
| Ticket      | W-23051169                                              |
| Change type | Feat                                                    |
| Files       | `.github/workflows/release-on-merge.yml`, `src/test/releaseOnMergeWorkflow.mjs`, `package.json` |

---

## Background

commerce-sdk-isomorphic PR #289 added a GitHub Actions workflow that automatically
creates a Git tag and GitHub release when a release PR merges to `main`. This plan
ports those three changes verbatim to `commerce-sdk`. The workflow is repo-agnostic
(reads `package.json` and `CHANGELOG.md`); no path edits needed. The only
adaptation: commerce-sdk uses `npm` instead of `yarn`.

---

## Task 1: Add the test file (`src/test/releaseOnMergeWorkflow.mjs`)

Test-first: the test exercises the workflow's shell logic in isolation and must
exist before the workflow YAML (it reads the YAML from disk).

### File to create

`src/test/releaseOnMergeWorkflow.mjs`

### Content (verbatim from isomorphic PR #289)

```javascript
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
```

### Verification (will fail — workflow YAML does not exist yet)

```bash
node --test src/test/releaseOnMergeWorkflow.mjs
# Expected: Error — cannot read release-on-merge.yml
```

### Commit

```
feat(ci): add release-on-merge workflow tests

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

## Task 2: Add the workflow YAML (`.github/workflows/release-on-merge.yml`)

### File to create

`.github/workflows/release-on-merge.yml`

### Content (verbatim from isomorphic PR #289)

```yaml
name: Release on merge

on:
  pull_request:
    types: [closed]
    branches: [main]

jobs:
  tag-and-release:
    if: github.event.pull_request.merged == true && startsWith(github.event.pull_request.head.ref, 'release/v')
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.merge_commit_sha }}
          fetch-depth: 0

      - id: version
        name: Resolve version and cross-check sources
        env:
          HEAD_REF: ${{ github.event.pull_request.head.ref }}
        run: |
          set -euo pipefail

          if [[ ! "$HEAD_REF" =~ ^release/v([0-9]+\.[0-9]+\.[0-9]+)$ ]]; then
            echo "::error::Branch name does not match release format: $HEAD_REF"
            exit 1
          fi
          BRANCH_VERSION="${BASH_REMATCH[1]}"

          PKG_VERSION=$(node -p "require('./package.json').version")

          CHANGELOG_VERSION=$(awk '/^## v[0-9]+\.[0-9]+\.[0-9]+/ { sub(/^## v/, ""); print; exit }' CHANGELOG.md)

          if [[ "$BRANCH_VERSION" != "$PKG_VERSION" || "$PKG_VERSION" != "$CHANGELOG_VERSION" ]]; then
            echo "::error::Version mismatch across sources"
            echo "  branch:        $BRANCH_VERSION"
            echo "  package.json:  $PKG_VERSION"
            echo "  CHANGELOG.md:  $CHANGELOG_VERSION"
            exit 1
          fi

          echo "version=v$BRANCH_VERSION" >> "$GITHUB_OUTPUT"
          echo "Resolved release version: v$BRANCH_VERSION"

      - id: notes
        name: Extract release notes from CHANGELOG
        env:
          VER: ${{ steps.version.outputs.version }}
        run: |
          set -euo pipefail

          NOTES=$(awk -v ver="$VER" '
            $0 == "## " ver { found=1; next }
            found && /^## v/ { exit }
            found { print }
          ' CHANGELOG.md | awk 'NF{p=1} p' | awk '{lines[NR]=$0} END{for(i=NR;i>0;i--){if(lines[i]!=""){last=i;break}} for(i=1;i<=last;i++) print lines[i]}')

          if [[ -z "$NOTES" ]]; then
            echo "::error::No CHANGELOG section found for $VER"
            exit 1
          fi

          {
            echo "notes<<RELEASE_NOTES_b3c1f8a4_DELIM"
            echo "$NOTES"
            echo "RELEASE_NOTES_b3c1f8a4_DELIM"
          } >> "$GITHUB_OUTPUT"

      - id: tag-exists
        name: Check if tag already exists
        env:
          TAG: ${{ steps.version.outputs.version }}
        run: |
          set -euo pipefail
          if git ls-remote --tags --exit-code origin "refs/tags/$TAG" >/dev/null 2>&1; then
            echo "Tag $TAG already exists on origin — skipping tag creation"
            echo "exists=true" >> "$GITHUB_OUTPUT"
          else
            echo "exists=false" >> "$GITHUB_OUTPUT"
          fi

      - name: Create and push tag
        if: steps.tag-exists.outputs.exists == 'false'
        env:
          TAG: ${{ steps.version.outputs.version }}
          SHA: ${{ github.event.pull_request.merge_commit_sha }}
        run: |
          set -euo pipefail
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git tag -a "$TAG" -m "$TAG" "$SHA"
          git push origin "$TAG"

      - name: Create GitHub release
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          TAG: ${{ steps.version.outputs.version }}
          NOTES: ${{ steps.notes.outputs.notes }}
        run: |
          set -euo pipefail
          if gh release view "$TAG" >/dev/null 2>&1; then
            echo "Release $TAG already exists — skipping"
            exit 0
          fi
          gh release create "$TAG" --title "$TAG" --notes "$NOTES"
```

### Verification (tests should now pass)

```bash
node --test src/test/releaseOnMergeWorkflow.mjs
# Expected: 14 tests pass (0 failures)
```

### Commit

```
feat(ci): add release-on-merge workflow

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

## Task 3: Wire `test:workflow` into `package.json`

### File to modify

`package.json`

### Changes

In the `"scripts"` object, add the `test:workflow` script and chain it into the
existing `test` script.

**Before:**

```json
"pretest": "npm run lint && npm run depcheck",
"test": "nyc mocha \"src/**/*.test.ts\"",
"test:ci": "npm test -- --reporter=xunit --reporter-options output=./reports/generator.xml",
```

**After:**

```json
"pretest": "npm run lint && npm run depcheck",
"test": "nyc mocha \"src/**/*.test.ts\" && npm run test:workflow",
"test:ci": "npm test -- --reporter=xunit --reporter-options output=./reports/generator.xml",
"test:workflow": "node --test src/test/releaseOnMergeWorkflow.mjs",
```

### Verification (full test suite including new workflow tests)

```bash
npm run test:workflow
# Expected: 14 tests pass

npm test
# Expected: existing mocha tests pass, then workflow tests pass
```

### Commit

```
feat(ci): wire release-on-merge tests into npm test

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

## Task 4: Final validation

This is not a code-change task. It is a verification-only step to confirm the
full change set is green.

### Checks to run

```bash
# 1. Workflow tests in isolation
node --test src/test/releaseOnMergeWorkflow.mjs

# 2. Full test suite (lint + depcheck + mocha + workflow)
npm test

# 3. Confirm CHANGELOG.md awk extractability with the real repo file
awk '/^## v[0-9]+\.[0-9]+\.[0-9]+/ { sub(/^## v/, ""); print; exit }' CHANGELOG.md
# Expected output: 6.3.0

# 4. Confirm workflow file is valid YAML (syntax check)
node -e "const yaml = require('yaml'); const fs = require('fs'); yaml.parse(fs.readFileSync('.github/workflows/release-on-merge.yml','utf8')); console.log('YAML OK')" 2>/dev/null || python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/release-on-merge.yml')); print('YAML OK')"
```

### Expected outcomes

- All 14 workflow tests pass
- Existing mocha test suite still passes
- awk outputs `6.3.0`
- YAML parses without error

No commit for this task (verification only).

---

## Notes for the implementer

1. **Package manager**: commerce-sdk uses `npm` (no `yarn.lock` present). The
   `test:workflow` script uses `npm run`, not `yarn run`.

2. **Node version**: `node --test` requires Node >= 18. The repo's CI runs Node
   18+. Locally confirmed Node 24.6.0.

3. **Legacy release branches**: Remote has `release/YYYYMMDD` branches. The
   workflow regex `^release/v([0-9]+\.[0-9]+\.[0-9]+)$` intentionally excludes
   them. Test case "rejects the legacy date-suffix branch format" locks this.

4. **No npm publish**: The workflow only creates a tag and GitHub release. The
   existing `publish.yml` workflow handles npm publish separately.

5. **Branch discipline**: Stay on the worktree's current branch. Do not create a
   new branch — the workflow runner manages branching.

6. **sort-package-json**: The `pretest` script runs `npm run lint` which calls
   `sort-package-json`. After editing `package.json`, the key order will be
   normalized by the lint pass. The `test:workflow` key sorts after `test:ci`
   alphabetically, which is already its natural position.
