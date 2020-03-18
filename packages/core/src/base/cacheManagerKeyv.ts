/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * This cache manager implementation uses Keyv, a simple key-value storage with
 * support for multiple backends.
 * 
 * https://github.com/lukechilds/keyv
 * 
 * See the documentation for how to initialize the backend connection. While
 * Keyv has support for multiple backends, initial testing and support for this
 * implementation is limited to Redis.
 */
import fetch = require("minipass-fetch");
import Keyv = require("keyv");

import { ICacheManager } from "./cacheManager";

export class CacheManagerKeyv implements ICacheManager {
  public keyv;

  constructor(public connection = "redis://localhost:6379") {
    this.keyv = new Keyv(connection);
    this.keyv.on("error", console.error);
  }

  async match(request:fetch.Request):fetch.Response {
    console.log(`MATCH REDIS ${request.url}`);
    const cachedData = await this.keyv.get(request.url);
    if (cachedData) {
      console.log(`FOUND ${request.url}`);
      const cachedResponse = new fetch.Response(JSON.stringify(cachedData.body), {
        url: request.url,
        headers: cachedData.headers,
        status: 200
      });
      return cachedResponse;
    } else {
      console.log(`NO CACHE FOR ${request.url}`);
    }
  }

  // Returns a Promise that resolves to an array of all matching requests in the Cache object.
  async matchAll(request: object, options: object): Promise<object> {
    console.log("MATCH ALL FUNCTION");
    return [{ p: "MATCH ALL" }];
  }

  // Takes a URL, retrieves it and adds the resulting response object to the given cache. This is functionally equivalent to calling fetch(), then using put() to add the results to the cache.
  add(request: object): void {
    console.log("ADD FUNCTION");
  }

  // Takes an array of URLs, retrieves them, and adds the resulting response objects to the given cache.
  addAll(requests: object): void {
    console.log("ADD ALL FUNCTION");
  }

  async put(req, res) {
    console.log(`PUT REDIS ${req.url}`);
    const body = await res.json();
    await this.keyv.set(
      req.url,
      {
        body: body,
        headers: res.headers.raw()
      }
    );
    return new fetch.Response(JSON.stringify(body), res);
  }

  async delete(req) {
    console.log("DELETE REDIS");
    return this.keyv.delete(req.url);
  }

  // Returns a Promise that resolves to an array of Cache keys.
  async keys(request: object, options: object) {
    console.log("KEYS FUNCTION");
  }
}
