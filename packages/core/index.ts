/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Resource } from "./src/base/resource";

const res = new Resource(
  "http://baseuri/",
  {},
  "/foo/bar",
  {},
  {
    refine: ["something", "otherthing,withcomma"]
  }
);

console.log(res.toString());
