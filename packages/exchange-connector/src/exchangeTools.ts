/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { RestApi } from "./exchangeTypes";
import _ from "lodash";

/**
 * @description Group APIs by a category in exchange
 * @export
 * @param {RestApi[]} apis
 * @param {string} groupBy
 * @param {boolean} [allowUnclassified=true]
 * @returns {{ [key: string]: RestApi[] }} List of Apis grouped by category
 */
export function groupByCategory(
  apis: RestApi[],
  groupBy: string,
  allowUnclassified = true
): { [key: string]: RestApi[] } {
  return _.groupBy(apis, api => {
    // Categories are actually a list.
    // We are just going to use whatever the first one is for now
    if (api.categories && groupBy in api.categories) {
      return api.categories[groupBy][0];
    } else if (allowUnclassified) {
      return "unclassified";
    } else {
      throw new Error("Unclassified APIs are NOT allowed!");
    }
  });
}
