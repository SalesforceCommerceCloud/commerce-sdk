/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
export {
  BaseClient,
  ClientConfig,
  Response,
  ResponseError
} from "./base/client";

import { _get, _delete, _patch, _post, _put } from "./base/staticClient";

export const StaticClient = {
  get: _get,
  delete: _delete,
  patch: _patch,
  post: _post,
  put: _put
};

export { IAuthToken, ShopperToken, stripBearer } from "./base/authHelper";

export {
  commonParameterPositions,
  CommonParameters
} from "./base/commonParameters";
