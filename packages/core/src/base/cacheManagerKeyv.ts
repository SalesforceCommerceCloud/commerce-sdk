/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";

import fetch from "minipass-fetch";
import Keyv from "keyv";
import ssri from "ssri";
import url from "url";

import { ICacheManager } from "./cacheManager";
import { sdkLogger } from "./sdkLogger";

/**
 * List of custom headers we add to cached responses before returning.
 */
export const customCacheHeaders = {
  localCache: "X-Local-Cache",
  localCacheKey: "X-Local-Cache-Key",
  localCacheHash: "X-Local-Cache-Hash",
  localCacheTime: "X-Local-Cache-Time"
};

const addCacheHeaders = (resHeaders, path, key, hash, time): void => {
  resHeaders.set(customCacheHeaders.localCache, encodeURIComponent(path));
  resHeaders.set(customCacheHeaders.localCacheKey, encodeURIComponent(key));
  resHeaders.set(customCacheHeaders.localCacheHash, encodeURIComponent(hash));
  resHeaders.set(
    customCacheHeaders.localCacheTime,
    new Date(time).toUTCString()
  );
};

/**
 * Determines the response to be cached or not.
 *
 * @param response The response to determine ability for caching
 *
 * @returns boolean to cache the response or not
 */
const shouldCache = (response: fetch.Response): boolean => {
  const responseControl = response.headers
    .get("cache-control")
    ?.toLowerCase()
    .trim()
    .split(/\s*,\s*/);

  return !(
    responseControl &&
    (responseControl.includes("private") ||
      responseControl.includes("no-store"))
  );
};

/**
 * Parses the URL string and sorts query params.
 *
 * @param urlString The URL to be normalized
 *
 * @returns The normalized URL as a string
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
 *
 * @returns A string of the cache key
 */
const makeCacheKey = (req: fetch.Request): string => normalizeUrl(req.url);

const getMetadataKey = (req: fetch.Request): string =>
  `request-cache-metadata:${makeCacheKey(req)}`;

const getContentKey = (req: fetch.Request): string =>
  `request-cache:${makeCacheKey(req)}`;

/**
 * Check if a cached request is a valid match for a given request.
 *
 * @param req The request to find a cached response for
 * @param cached The cached response
 *
 * @returns true for a match, false for a miss
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
  public uncacheableRequestHeaders: string[] = ["authorization"];

  constructor(options?: {
    connection?: string;
    keyvOptions?: {};
    keyvStore?: {};
  }) {
    if (options?.keyvStore) {
      this.keyv = new Keyv({ store: options.keyvStore });
      this.keyv.on("error", sdkLogger.error);
      return;
    }

    if (options?.connection) {
      this.keyv = new Keyv(options.connection, options.keyvOptions);
      this.keyv.on("error", sdkLogger.error);
    }
  }

  /**
   * Returns a Promise that resolves to the response associated with the first
   * matching request in the Cache object.
   *
   * @param req The request to check for a cached response
   * @param opts Currently for compatibility
   *
   * @returns A valid cached response or undefined
   */
  async match(req: fetch.Request, opts?: any): Promise<fetch.Response> {
    if (!req) {
      throw new Error("Valid request object required to match");
    }
    this.stripUncacheableRequestHeaders(req);
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
    const body: string = await this.keyv.get(contentKey);

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
   *
   * @returns The response or copy of the response
   */
  async put(
    req: fetch.Request,
    response: fetch.Response,
    opts?: any
  ): Promise<fetch.Response> {
    opts = opts || {};
    if (!req) {
      throw new Error("Valid request object required to put");
    }
    if (!response) {
      throw new Error("Valid response object required to put");
    }
    this.stripUncacheableRequestHeaders(req);
    const size = response?.headers?.get("content-length");
    const metadataKey = getMetadataKey(req);
    const contentKey = getContentKey(req);

    if (!shouldCache(response)) {
      return response;
    }

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
      const redisInfo = await this.keyv.get(metadataKey);
      // Providing these will bypass content write
      cacheOpts.integrity = redisInfo.integrity;
      addCacheHeaders(
        response.headers,
        "",
        contentKey,
        redisInfo.integrity,
        redisInfo.time
      );
      await this.keyv.set(metadataKey, cacheOpts);

      return response;
    }

    const body = await response.text();

    await this.keyv.set(metadataKey, cacheOpts);

    await this.keyv.set(contentKey, body);

    return Promise.resolve(new fetch.Response(Buffer.from(body), response));
  }

  /**
   * Finds the Cache entry whose key is the request, and if found, deletes the
   * Cache entry and returns a Promise that resolves to true. If no Cache entry
   * is found, it returns false.
   *
   * @param req The request to try to delete a cached response for
   * @param opts Compatibility with make-fetch-happen, currently unused
   *
   * @returns true is anything is present to delete, false otherwise
   */
  async delete(req: fetch.Request, opts?: any): Promise<boolean> {
    if (!req) {
      throw new Error("Valid request object required to delete");
    }
    this.stripUncacheableRequestHeaders(req);

    return (
      await Promise.all([
        this.keyv.delete(getMetadataKey(req)),
        this.keyv.delete(getContentKey(req))
      ])
    ).includes(true);
  }

  stripUncacheableRequestHeaders(req: fetch.Request): fetch.Request {
    this.uncacheableRequestHeaders.forEach((header: string) =>
      req.headers.delete(header)
    );
    return req;
  }
}
