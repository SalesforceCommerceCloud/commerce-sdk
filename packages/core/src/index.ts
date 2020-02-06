/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
export {
  BaseClient,
  BaseClientConfig,
  Response,
  ResponseError
} from "./base/client";

export { IAuthScheme, AccountManager, AuthSchemes } from "./base/auth-schemes";

import { _get, _delete, _patch, _post, _put } from "./base/static-client";

export const StaticClient = {
  get: _get,
  delete: _delete,
  patch: _patch,
  post: _post,
  put: _put
};

export { IAuthToken, ShopperToken, stripBearer } from "./base/auth-helper";
