/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as log from "loglevel";

const COMMERCE_SDK_LOGGER_KEY = "COMMERCE_SDK_LOGGER";

const sdkLogger = log.getLogger(COMMERCE_SDK_LOGGER_KEY);
sdkLogger.setLevel(log.levels.WARN);

export { sdkLogger };
