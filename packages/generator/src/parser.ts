/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { WebApiParser, WebApiBaseUnit } from "webapi-parser";

function processRamlFile(ramlFile: string): Promise<WebApiBaseUnit> {
  return WebApiParser.raml10.parse(`file://${ramlFile}`);
}

export { processRamlFile };
