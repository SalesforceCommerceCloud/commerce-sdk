/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as log from "loglevel";
require("dotenv").config();

const SDK_GENERATOR_LOGGER_KEY = "SDK_GENERATOR_LOGGER";

let level = process.env.SDK_GENERATOR_LOG_LEVEL as log.LogLevelDesc;
if (level == null) {
  level = log.levels.INFO;
}
const generatorLogger = log.getLogger(SDK_GENERATOR_LOGGER_KEY);
generatorLogger.setLevel(level);

export { generatorLogger };
