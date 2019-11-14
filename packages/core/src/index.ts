export {
  BaseClient,
  ClientConfig,
  Response,
  ResponseError
} from "./base/client";

export { IAuthScheme, AccountManager, AuthSchemes } from "./base/auth-schemes";

import { _get, _delete, _post, _put } from "./base/static-client";

export const StaticClient = {
  get: _get,
  delete: _delete,
  post: _post,
  put: _put
};
