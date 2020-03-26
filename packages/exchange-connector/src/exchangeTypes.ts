/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

export type RestApi = {
  id: string;
  name: string;
  groupId: string;
  assetId: string;
  description?: string;
  updatedDate?: string;
  version?: string;
  categories?: Categories;
  fatRaml?: FileInfo;
};

export type FileInfo = {
  classifier: string;
  packaging: string;
  externalLink?: string;
  createdDate: string;
  mainFile: string;
  md5: string;
  sha1: string;
};

export type Categories = {
  [key: string]: string[];
};
