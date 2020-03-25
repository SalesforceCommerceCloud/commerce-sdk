/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";

import fetch = require("minipass-fetch");
import Keyv = require("keyv");
import ssri = require("ssri");
import url = require("url");
import { ICacheManager } from "./cacheManager";

const makeCacheKey = req => {
  const parsed = new url.URL(req.url);
  return url.format({
    protocol: parsed.protocol,
    slashes: true,
    port: parsed.port,
    hostname: parsed.hostname,
    pathname: parsed.pathname
  });
};

const getMetadataKey = req => `request-cache-metadata:${makeCacheKey(req)}`;

const getContentKey = req => `request-cache:${makeCacheKey(req)}`;

const addCacheHeaders = (resHeaders, path, key, hash, time) => {
  resHeaders.set("X-Local-Cache", encodeURIComponent(path));
  resHeaders.set("X-Local-Cache-Key", encodeURIComponent(key));
  resHeaders.set("X-Local-Cache-Hash", encodeURIComponent(hash));
  resHeaders.set("X-Local-Cache-Time", new Date(time).toUTCString());
};

const matchDetails = (req, cached) => {
  const reqUrl = new url.URL(req.url);
  const cacheUrl = new url.URL(cached.url);
  const vary = cached.resHeaders.get("Vary");
  // https://tools.ietf.org/html/rfc7234#section-4.1
  if (vary) {
    // A Vary header field-value of "*" always fails to match.
    if (vary.match(/\*/)) {
      return false;
    } else {
      const fieldsMatch = vary.split(/\s*,\s*/).every(field => {
        return cached.reqHeaders.get(field) === req.headers.get(field);
      });
      if (!fieldsMatch) {
        return false;
      }
    }
  }
  if (cached.integrity) {
    return ssri.parse(cached.integrity).match(cached.cacheIntegrity);
  }
  reqUrl.hash = null;
  cacheUrl.hash = null;
  return url.format(reqUrl) === url.format(cacheUrl);
};

/**
 * This is an implementation of the Cache standard for make-fetch-happen using
 * the Keyv storage interface. The primary target is Redis.
 * docs: https://developer.mozilla.org/en-US/docs/Web/API/Cache
 * https://www.npmjs.com/package/keyv
 */
export class CacheManagerKeyv implements ICacheManager {
  public keyv;

  constructor(public connection?: string) {
    if (connection) {
      this.keyv = new Keyv(connection, { keepAlive: false });
      this.keyv.on("error", console.error);
    }
  }

  // Returns a Promise that resolves to the response associated with the first
  // matching request in the Cache object.
  async match(req: fetch.Request, opts?: any): Promise<fetch.Response> {
    const metadataKey = getMetadataKey(req);
    const contentKey = getContentKey(req);
    const redisInfo = await this.keyv.get(metadataKey);
    if (!redisInfo) {
      console.log("NO MATCH");
      return;
    }
    console.log(`GOT ${redisInfo.metadata.url}`);
    const resHeaders = new fetch.Headers(redisInfo.metadata.resHeaders);
    addCacheHeaders(
      resHeaders,
      "",
      contentKey,
      redisInfo.integrity,
      redisInfo.time
    );

    if (
      !matchDetails(req, {
        url: redisInfo.metadata.url,
        reqHeaders: new fetch.Headers(redisInfo.metadata.reqHeaders),
        resHeaders: new fetch.Headers(redisInfo.metadata.resHeaders),
        cacheIntegrity: redisInfo.integrity,
        integrity: opts && opts.integrity
      })
    ) {
      console.log("NO EXACT MATCH");
      return;
    }
    console.log("EXACT MATCH!");
    console.log("RETURNING REDIS DATA");

    if (req.method === "HEAD") {
      console.log("IT'S A HEAD REQUEST");
      return new fetch.Response(null, {
        url: req.url,
        headers: resHeaders,
        status: 200
      });
    }

    const body = await this.keyv.get(getContentKey(req));

    return Promise.resolve(
      new fetch.Response(Buffer.from(JSON.stringify(body)), {
        url: req.url,
        headers: resHeaders,
        status: 200,
        size: redisInfo.size
      })
    );
  }

  // Takes both a request and its response and adds it to the given cache.
  async put(
    req: fetch.Request,
    response: fetch.Response,
    opts?
  ): Promise<fetch.Response> {
    opts = opts || {};
    const size = response?.headers?.get("content-length");
    console.log(`PUT SIZE ${size}`);
    const ckey = getContentKey(req);
    const cacheOpts = {
      algorithms: opts.algorithms,
      integrity: null,
      metadata: {
        url: req.url,
        reqHeaders: req.headers.raw(),
        resHeaders: response.headers.raw()
      },
      size
    };
    if (req.method === "HEAD" || response.status === 304) {
      // Update metadata without writing
      const redisInfo = await this.keyv.get(getMetadataKey(req));
      // Providing these will bypass content write
      cacheOpts.integrity = redisInfo.integrity;
      addCacheHeaders(
        response.headers,
        "",
        ckey,
        redisInfo.integrity,
        redisInfo.time
      );
      await this.keyv.set(getMetadataKey(req), cacheOpts);

      return response;
    }

    const body = await response.text();

    console.log("WRITE META TO REDIS");
    await this.keyv.set(getMetadataKey(req), cacheOpts);

    await this.keyv.set(getContentKey(req), body);

    return Promise.resolve(new fetch.Response(Buffer.from(body), response));
  }

  // Finds the Cache entry whose key is the request, and if found, deletes the
  // Cache entry and returns a Promise that resolves to true. If no Cache entry
  // is found, it returns false.
  async delete(req: fetch.Request, opts?): Promise<boolean> {
    console.log("DELETEING FROM REDIS");
    return (
      (await this.keyv.delete(getMetadataKey(req))) ||
      (await this.keyv.delete(getContentKey(req)))
    );
  }
}
