/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { callCustomEndpoint } from "./customApi";
import { encodeSCAPISpecialCharacters } from "./fetchHelpers";
export const helpers = {
  callCustomEndpoint,
  encodeSCAPISpecialCharacters,
};
export * as slasHelpers from "./slas";
