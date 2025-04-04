/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Single encodes SCAPI specific special characters (percentage sign `%` and comma `,`) in the given string in UTF-8
 * Does not encode any other special characters in the string
 * @param str - The string to encode
 * @returns The encoded string
 */
export const encodeSCAPISpecialCharacters = (str: string): string =>
  str.replace(/%/g, "%25").replace(/,/g, "%2C");
