/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/*
 * This interface is the Web API Cache interface as specified:
 * https://developer.mozilla.org/en-US/docs/Web/API/Cache
 * It's recommended to not modify this so it conforms to the spec.
 */
export interface ICacheManager {
  // Returns a Promise that resolves to the response associated with the first matching request in the Cache object.
  match(request: object, options: object): Promise<object>;

  // Returns a Promise that resolves to an array of all matching requests in the Cache object.
  matchAll(request: object, options: object): Promise<object>;

  // Takes a URL, retrieves it and adds the resulting response object to the given cache. This is functionally equivalent to calling fetch(), then using put() to add the results to the cache.
  add(request: object): void;

  // Takes an array of URLs, retrieves them, and adds the resulting response objects to the given cache.
  addAll(requests: object): void;

  // Takes both a request and its response and adds it to the given cache.
  put(request: object, response: object): void;

  // Finds the Cache entry whose key is the request, returning a Promise that resolves to true if a matching Cache entry is found and deleted. If no Cache entry is found, the promise resolves to false.
  delete(request: object, options: object): Promise<object>;

  // Returns a Promise that resolves to an array of Cache keys.
  keys(request: object, options: object);
}
