/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";
import chai from "chai";
import { USER_AGENT } from "../src/base/client";
// Using an import statement causes issues with TypeScript,
// so we have to use require with the package.json
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require("../../generator/package.json");

const { expect } = chai;

describe("User-Agent header", () => {
  it("includes commerce-sdk version", () => {
    expect(USER_AGENT).to.include(pkg.version);
  });
});
