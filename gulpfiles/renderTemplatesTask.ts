/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as gulp from "gulp";
import { renderTemplates } from "../src/renderer";

// Gulp changes the working directory to here, but we want to be up a level
process.chdir("..");
// Gulp logs that it changed the working directory, so we should too
console.log(`Working directory changed to ${process.cwd()}`);

require("dotenv").config();

import config from "../build-config";

/**
 *  Renders the TypeScript code for the APIs using the pre-defined templates
 */
gulp.task("renderTemplates", async () => renderTemplates(config));
