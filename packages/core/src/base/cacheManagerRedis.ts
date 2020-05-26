/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";

import Redis from "ioredis";
import KeyvRedis from "@keyv/redis";

import { CacheManagerKeyv } from "./cacheManagerKeyv";

/**
 * This is an implementation of the Cache standard for make-fetch-happen using
 * the Keyv storage interface to write to Redis.
 * docs: https://developer.mozilla.org/en-US/docs/Web/API/Cache
 * https://www.npmjs.com/package/keyv
 */
export class CacheManagerRedis extends CacheManagerKeyv {
  constructor(options?: {
    connection?: string;
    keyvOptions?: {};
    keyvStore?: {};
    clusterConfig?: {};
  }) {
    if (options?.clusterConfig) {
      // TODO: Remove workaround when luster support is added (hopefully soon):
      // https://github.com/lukechilds/keyv-redis/pull/37
      // The workaround below can be replaced with the following code:
      // options.keyvStore = new KeyvRedis(
      //   new Redis.Cluster(options.clusterConfig)
      // );

      // KeyvRedis does not directly support Redis clusters, but clusters have
      // the same interface as normal Redis instances, so we can replace the
      // the KeyvRedis default instance with our own cluster
      const keyvStore = new KeyvRedis();
      // We don't want to use the default connection, so we have to close it
      keyvStore.redis?.quit();
      keyvStore.redis = new Redis.Cluster(options.clusterConfig);
      options.keyvStore = keyvStore;
    }
    super(options);
  }

  /**
   * Redis will attempt to maintain an active connection which prevents Node.js
   * from exiting. Call this to gracefully close the connection.
   *
   * @returns true for successful disconnection
   */
  async quit(): Promise<boolean> {
    return (await this.keyv?.opts?.store?.redis?.quit()) === "OK";
  }
}
