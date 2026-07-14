/*
 * Copyright (c) 2026, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/*
 * Locks the auto-publish design across .github/workflows/release-on-merge.yml
 * and .github/workflows/publish.yml.
 *
 * Both workflows fire from the same pull_request: closed event on a merged
 * release/v* branch; neither depends on a release: published event authored
 * by the other. This sidesteps GitHub's chain-block on GITHUB_TOKEN-authored
 * release events (a release created by GITHUB_TOKEN cannot trigger a
 * downstream workflow, which historically broke the chain-based design).
 *
 * These assertions catch regressions at the string level: a stray revert to
 * release: published, a swap back to a PAT, or a dropped branch-pattern guard
 * would all reintroduce known failure modes.
 */

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const releaseOnMerge = readFileSync(
  resolve(repoRoot, '.github', 'workflows', 'release-on-merge.yml'),
  'utf8',
);
const publish = readFileSync(
  resolve(repoRoot, '.github', 'workflows', 'publish.yml'),
  'utf8',
);

test('publish.yml fires on pull_request: closed against main', () => {
  assert.match(
    publish,
    /^on:\n\s+pull_request:\n\s+types: \[closed\]\n\s+branches: \[main\]/m,
    'publish.yml must trigger on pull_request: closed for main so it fires alongside release-on-merge from the same merge event',
  );
});

test('publish.yml job condition matches release-on-merge (merged + same-repo + release-branch pattern)', () => {
  assert.match(
    publish,
    /if: \|\n\s+github\.event_name == 'workflow_dispatch' \|\|\n\s+\(github\.event\.pull_request\.merged == true &&\n\s+github\.event\.pull_request\.head\.repo\.full_name == github\.repository &&\n\s+startsWith\(github\.event\.pull_request\.head\.ref, 'release\/v'\)\)/,
    'publish-to-npm job must gate on merged==true, same-repo head (fork-PR guard), and a release/v* head branch — mirroring release-on-merge.yml but with an added guard against a merged fork PR running npm publish with base-repo secrets',
  );
});

test('publish.yml checkout uses merge_commit_sha on the PR path, tag input on dispatch', () => {
  assert.match(
    publish,
    /uses: actions\/checkout@v4\n\s+with:\n\s+ref: \$\{\{ github\.event\.inputs\.tag \|\| github\.event\.pull_request\.merge_commit_sha \}\}/,
    'checkout must resolve to the merge commit on the PR path (same commit release-on-merge tags) and to the input tag on workflow_dispatch',
  );
});

test('publish.yml does not subscribe to release: published', () => {
  assert.doesNotMatch(
    publish,
    /^\s*release:\s*\n\s+types:\s*\[published\]/m,
    'publish.yml must not listen for release: published — that trigger reintroduces the GITHUB_TOKEN chain-block bug this design sidesteps',
  );
});

test('publish.yml workflow_dispatch declares a required tag input', () => {
  const re = /workflow_dispatch:\n(?:    [^\n]+\n)+/;
  const m = publish.match(re);
  assert.ok(m, 'workflow_dispatch block not found');
  const block = m[0];
  assert.match(block, /inputs:/, 'workflow_dispatch must define an inputs block');
  assert.match(block, /^ {6}tag:$/m, 'workflow_dispatch must define a tag input');
  assert.match(block, /required: true/, 'tag input must be required');
});

test('publish.yml cross-checks the target version against package.json and CHANGELOG.md before publishing', () => {
  assert.match(
    publish,
    /- name: Resolve version and cross-check sources/,
    'publish.yml must run the tri-source cross-check step so a version-mismatched merge cannot ship npm without a matching tag',
  );
  assert.match(
    publish,
    /HEAD_REF[^\n]*=~[^\n]*\^release\/v\(\[0-9\]/,
    'PR-path cross-check must extract the expected version from the release/v* branch name',
  );
  assert.match(
    publish,
    /TAG_INPUT[^\n]*=~[^\n]*\^v\(\[0-9\]/,
    'dispatch-path cross-check must validate the tag input matches vX.Y.Z — otherwise workflow_dispatch trusts an unvalidated ref',
  );
  assert.match(
    publish,
    /require\('\.\/package\.json'\)\.version/,
    'cross-check must read package.json.version',
  );
  assert.match(
    publish,
    /awk[^\n]*CHANGELOG\.md/,
    'cross-check must read the version off CHANGELOG.md via awk',
  );
  assert.match(
    publish,
    /::error::Version mismatch across sources(?:[\s\S]*?)exit 1\n\s+fi\n/,
    'cross-check must exit non-zero on mismatch — echoing the error without exiting would let publish continue',
  );
});

test('release-on-merge authors the release with GITHUB_TOKEN, not a PAT', () => {
  assert.match(
    releaseOnMerge,
    /- name: Create GitHub release\n\s+env:\n\s+GH_TOKEN: \$\{\{ secrets\.GITHUB_TOKEN \}\}/,
    'the release-creation step must use GITHUB_TOKEN — the pivot away from RELEASE_PAT depends on publish.yml no longer needing the release: published event',
  );
  assert.doesNotMatch(
    releaseOnMerge,
    /GH_TOKEN: \$\{\{ secrets\.RELEASE_PAT \}\}/,
    'no step may reintroduce RELEASE_PAT — the PAT approach was rejected for org-policy reasons and the current design does not need it',
  );
});
