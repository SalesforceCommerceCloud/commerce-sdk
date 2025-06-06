/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { download } from "@commerce-apps/raml-toolkit";
import path from "path";

/**
 * Updates a set of APIs for an api family and saves it to a path.
 *
 * NOTE: Coverage passes without this function being covered.
 *  We should have some followup to figure out how to cover it.
 *  Ive spent hours trying to mock download
 *
 * @param apiFamily - Api family to download
 * @param rootPath - Root path to download to
 *
 * @returns a promise that we will complete
 */
export async function updateApis(
  apiFamily: string,
  rootPath: string,
  isOas: boolean
): Promise<void> {
  try {
    const apis = await download.search(
      `"${apiFamily}" category:Visibility = "External" category:"SDK Type" = "Commerce"`
    );
    // console.log(apis);
    // console.log(apiFamily);
    // forEach(apis, (api) => {
    //   console.log(api.categories);
    // });
    await download.downloadRestApis(
      apis,
      path.join(rootPath, apiFamily),
      isOas
    );
  } catch (e) {
    console.error(e);
  }
}
