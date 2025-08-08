/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {download} from '@commerce-apps/raml-toolkit';

/**
 * Searches for an API by name and downloads it to a folder.
 *
 * NOTE: Coverage passes without this function being covered.
 *  We should have some followup to figure out how to cover it.
 *  Ive spent hours trying to mock download
 *
 * @param searchQuery - Query to search exchange
 * @param rootPath - Root path to download to
 *
 * @returns a promise that we will complete
 */
export async function downloadLatestApis(
  searchQuery: string,
  rootPath: string
): Promise<void> {
  const matchedApis = await download.search(searchQuery, undefined, true);
  if (!(matchedApis?.length > 0)) {
    throw new Error(`No results in Exchange for '${searchQuery}'`);
  }
  try {
    await download.downloadRestApis(matchedApis, rootPath, true);
  } catch (err: unknown) {
    if (err instanceof Error) {
      err.message = `Failed to download API specs: ${err.message}`;
    }
    throw err;
  }
}