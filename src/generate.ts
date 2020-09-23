/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import path from "path";
import { generate } from "@commerce-apps/raml-toolkit";
import { registerHelpers, registerPartials, setupApis } from "./lib/utils";

const API_DIRECTORY = path.resolve(
  process.env.COMMERCE_SDK_INPUT_DIR || `${__dirname}/../apis`
);

registerHelpers();
registerPartials();

console.log(`Creating SDK for ${API_DIRECTORY}`);

setupApis(
  API_DIRECTORY,
  path.resolve(`${__dirname}/../renderedTemplates`)
).then((apis: generate.ApiMetadata) => apis.render());
