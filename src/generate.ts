/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import path from "path";
import { generate } from "@commerce-apps/raml-toolkit";
import { registerHelpers, registerPartials, setupApis } from "./lib/utils";
import { copySync } from "fs-extra";

const API_DIRECTORY = path.resolve(
  process.env.COMMERCE_SDK_INPUT_DIR || `${__dirname}/../apis`
);

const OUTPUT_DIRECTORY = path.join(__dirname, "../renderedTemplates/helpers");
const HELPERS_DIRECTORY = path.join(__dirname, "../src/static/helpers");

registerHelpers();
registerPartials();

console.log(`Creating SDK for ${API_DIRECTORY}`);

const skipTestFiles = (src: string): boolean => !/\.test\.[a-z]+$/.test(src);
copySync(HELPERS_DIRECTORY, OUTPUT_DIRECTORY, { filter: skipTestFiles });

setupApis(
  API_DIRECTORY,
  path.resolve(`${__dirname}/../renderedTemplates`)
).then((apis: generate.ApiMetadata) => apis.render());
