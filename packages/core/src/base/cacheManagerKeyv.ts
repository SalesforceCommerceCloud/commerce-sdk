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

/**
 * Parses the URL string and sorts query params.
 *
 * @param urlString The URL to be normalized
 */
const normalizeUrl = (urlString: string): string => {
  const parsed: url.URL = new url.URL(urlString);
  parsed.searchParams.sort();
  return parsed.toString();
};

/**
 * Generate the cache key for the request to be cached or retrieved.
 *
 * @param req The request to generate a cache key for
 */
const makeCacheKey = (req: fetch.Request): string => normalizeUrl(req.url);

const getMetadataKey = (req: fetch.Request): string =>
  `request-cache-metadata:${makeCacheKey(req)}`;

const getContentKey = (req: fetch.Request): string =>
  `request-cache:${makeCacheKey(req)}`;

const addCacheHeaders = (resHeaders, path, key, hash, time): void => {
  resHeaders.set("X-Local-Cache", encodeURIComponent(path));
  resHeaders.set("X-Local-Cache-Key", encodeURIComponent(key));
  resHeaders.set("X-Local-Cache-Hash", encodeURIComponent(hash));
  resHeaders.set("X-Local-Cache-Time", new Date(time).toUTCString());
};

/**
 * Check if a cached request is a valid match for a given request.
 *
 * @param req The request to find a cached response for
 * @param cached The cached response
 */
const matchDetails = (req: fetch.Request, cached: fetch.Request): boolean => {
  const reqUrl = new url.URL(normalizeUrl(req.url));
  const cacheUrl = new url.URL(normalizeUrl(cached.url));
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

  /**
   * Returns a Promise that resolves to the response associated with the first
   * matching request in the Cache object.
   *
   * @param req The request to check for a cached response
   * @param opts Currently for compatibility
   */
  async match(req: fetch.Request, opts?: any): Promise<fetch.Response> {
    const metadataKey: string = getMetadataKey(req);
    const contentKey: string = getContentKey(req);

    // No match if there's no metadata for this request
    const redisInfo = await this.keyv.get(metadataKey);
    if (!redisInfo) {
      return;
    }

    // No match if the metadata doesn't match
    if (
      !matchDetails(req, {
        url: redisInfo.metadata.url,
        reqHeaders: new fetch.Headers(redisInfo.metadata.reqHeaders),
        resHeaders: new fetch.Headers(redisInfo.metadata.resHeaders),
        cacheIntegrity: redisInfo.integrity,
        integrity: opts && opts.integrity
      })
    ) {
      return;
    }

    // Add customer headers to the response that include caching info
    const resHeaders: fetch.Headers = new fetch.Headers(
      redisInfo.metadata.resHeaders
    );
    addCacheHeaders(
      resHeaders,
      "",
      contentKey,
      redisInfo.integrity,
      redisInfo.time
    );

    // Return the response without a body for HEAD requests
    if (req.method === "HEAD") {
      return new fetch.Response(null, {
        url: req.url,
        headers: resHeaders,
        status: 200
      });
    }

    // Get the cached response body
    const body: string = await this.keyv.get(getContentKey(req));

    return Promise.resolve(
      new fetch.Response(Buffer.from(body), {
        url: req.url,
        headers: resHeaders,
        status: 200,
        size: redisInfo.size
      })
    );
  }

  /**
   * Takes both a request and its response and adds it to the given cache.
   *
   * @param req The request this is a storing a response for
   * @param response The response to be stored
   * @param opts
   */
  async put(
    req: fetch.Request,
    response: fetch.Response,
    opts?: any
  ): Promise<fetch.Response> {
    opts = opts || {};
    const size = response?.headers?.get("content-length");
    const ckey = getContentKey(req);
    const cacheOpts = {
      algorithms: opts.algorithms,
      integrity: null,
      metadata: {
        url: req.url,
        reqHeaders: req.headers.raw(),
        resHeaders: response.headers.raw()
      },
      size,
      time: Date.now()
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

    await this.keyv.set(getMetadataKey(req), cacheOpts);

    await this.keyv.set(getContentKey(req), body);

    return Promise.resolve(new fetch.Response(Buffer.from(body), response));
  }

  /**
   * Finds the Cache entry whose key is the request, and if found, deletes the
   * Cache entry and returns a Promise that resolves to true. If no Cache entry
   * is found, it returns false.
   */
  async delete(req: fetch.Request, opts?: any): Promise<boolean> {
    return (
      (await this.keyv.delete(getMetadataKey(req))) ||
      (await this.keyv.delete(getContentKey(req)))
    );
  }

  /**
   * Redis will attempt to maintain an active connection which prevents Node.js
   * from exiting. Call this to gracefully close the connection.
   */
  async quit(): Promise<boolean> {
    return (await this.keyv?.opts?.store?.redis?.quit()) == "OK";
  }
}
