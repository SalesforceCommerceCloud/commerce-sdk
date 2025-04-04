/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { encodeSCAPISpecialCharacters } from "./fetchHelpers";
import { expect } from "chai";

describe("encodeSCAPISpecialCharacters", () => {
  it("only encodes special characters `%` and `,` in a string", () => {
    const input = "women'sCategory,%@#$%^&*()_+,";
    const expectedOutput = "women'sCategory%2C%25@#$%25^&*()_+%2C";
    const output = encodeSCAPISpecialCharacters(input);
    expect(output).to.be.equal(expectedOutput);
  });

  it("returns the same string if no SCAPI special characters are included", () => {
    const input = "women'sCategory!@#$^&*()_+";
    const output = encodeSCAPISpecialCharacters(input);
    expect(output).to.be.equal(input);
  });
});
