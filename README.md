# commerce-sdk

[![CircleCI][circleci-image]][circleci-url]

The Salesforce Commerce SDK allows easy interaction with the Salesforce B2C Commerce platform APIs on the Node.js runtime.

Visit the [Commerce Cloud Developer Center](https://developer.commercecloud.com/) to learn more about Salesforce Commerce. The developer center has API documentation, getting started guides, community forums, and more.
​

## Prerequisites

Download and install Node.js and npm [here](https://nodejs.org/en/download/).
​

> **Note:** Only Node.js version 10 and 12 LTS are supported. Other versions can cause unexpected results. To use a different version of Node.js for other projects, you can manage multiple versions of Node.js with [nvm](https://github.com/nvm-sh/nvm).
> ​

## Installation

Use npm to install the Commerce SDK.
​

```
npm install commerce-sdk
```

## Usage

To use an SDK client, instantiate an object of that client and configure these parameters.

> **Note:** These are optional parameters.

| Parameter      | Description                                                                                                                             |
| -------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| baseUri        | URL of the service with which the SDK interacts. If the baseUri isn't provided, the default baseUri for the relevant RAML file is used. |
| clientId       | ID of the client account created with Salesforce Commerce.                                                                              |
| organizationId | The unique identifier for your Salesforce identity.                                                                                     |
| shortCode      | Region specific merchant ID.                                                                                                            |
| siteId         | A unique site ID (for example, RefArch or SiteGenesis).                                                                                 |

### Sample Code

```javascript
/**
 * Sample TypeScript code that shows how Commerce SDK can access Salesforce Commerce
 * APIs.
 * 
 * To learn more about the parameters please refer to https://developer.commercecloud.com/s/article/CommerceAPI-Get-Started
 */
​
// Import the SDK in TypeScript
// tsc requires the --esModuleInterop flag for this
import * as CommerceSdk from "commerce-sdk";
// For Javascript, use:
// import CommerceSdk from "commerce-sdk";
const { ClientConfig, helpers, Search } = CommerceSdk;
// Older Node.js versions can instead use:
// const { ClientConfig, helpers, Search } = require("commerce-sdk");

// Create a configuration to use when creating API clients
const config = {
    headers: {},
    parameters: {
      clientId: '<your-client-id>',
      organizationId: '<your-org-id>',
      shortCode: '<your-short-code>',
      siteId: '<your-site-id>'
    }
}

// Get a JWT to use with Shopper API clients, a guest token in this case
helpers.getShopperToken(config, { type: "guest" }).then(async (token) => {

    try {
        // Add the token to the client configuration
        config.headers["authorization"] = token.getBearerHeader();

        // Create a new ShopperSearch API client
        const searchClient = new Search.ShopperSearch(config);

        // Search for dresses
        const searchResults = await searchClient.productSearch({
            parameters: {
                q: "dress",
                limit: 5
            }
        });

        if (searchResults.total) {
            const firstResult = searchResults.hits[0];
            console.log(`${firstResult.productId} ${firstResult.productName}`);
        } else {
            console.log("No results for search");
        }

        return searchResults;

    } catch (e) {
        // Print the status code and status text
        console.error(e);
        // Print the body of the error
        console.error(await e.response.text());
    }
}).catch(async (e) => {
    console.error(e);
    console.error(await e.response.text());
});
```

### Error Handling

SDK methods return an appropriate object by default when the API call returns a successful response. The object is built from the body of the response. If the API response is not successful, an Error is thrown. The error message is set to the status code plus the status text. The Error object includes a custom 'response' attribute with the entire Response object for inspection. To access the body of the response when an error occurs, see sample code above.

### Autocompletion

When using an IDE such as VSCode, the autocomplete feature lets you view the available method and class definitions, including parameters.
​

![Autocomplete](https://github.com/SalesforceCommerceCloud/commerce-sdk/raw/master/images/Autocomplete.jpg?raw=true 'Autocomplete')

To view the details of a method or a variable, hover over methods and variables.
​

![Method Details](https://github.com/SalesforceCommerceCloud/commerce-sdk/raw/master/images/MethodDetails.jpg?raw=true 'Method Details')

![Parameter Details](https://github.com/SalesforceCommerceCloud/commerce-sdk/raw/master/images/ParameterDetails.jpg?raw=true 'Parameter Details')

Autocomplete also shows the available properties of the data returned by SDK methods.

![Result Autocomplete](https://github.com/SalesforceCommerceCloud/commerce-sdk/raw/master/images/ResultAutocomplete.jpg?raw=true 'Result Autocomplete')

## Caching

The SDK currently supports two types of caches - In-memory and Redis. Both the implementations respect [standard cache headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control). To use another type of cache, write your own implementation of the [CacheManager](https://github.com/SalesforceCommerceCloud/commerce-sdk-core/tree/master/src/base/cacheManager.ts). See the [default cache manager](https://github.com/SalesforceCommerceCloud/commerce-sdk-core/tree/master/src/base/cacheManagerKeyv.ts) to design your implementation.

### Cache storage adapter

The default cache storage is limited to 10,000 distinct entities before applying a simple [least recently used](https://en.m.wikipedia.org/wiki/Cache_replacement_policies#Least_Recently_Used_.28LRU.29) policy for cache replacement. The limit can be changed by creating a [quick-lru](https://www.npmjs.com/package/quick-lru) storage adapter.

```javascript
import { CacheManagerKeyv } from '@commerce-apps/core';
import { QuickLRU } from 'quick-lru';

const cacheManagerKeyv = new CacheManagerKeyv({
  keyvStore: new QuickLRU({ maxSize: 50000 }),
});
const config = {
  cacheManager: cacheManagerKeyv,
  parameters: {
    clientId: '<your-client-id>',
    organizationId: '<your-org-id>',
    shortCode: '<your-short-code>',
    siteId: '<your-site-id>'
  },
};
```

See these [directions](https://www.npmjs.com/package/keyv#third-party-storage-adapters) to create a cache storage adapter.

### In-memory cache

In-memory caching of responses is enabled by default. To disable caching for a client, set cacheManager to 'null'.

```javascript
const config = {
  cacheManager: null,
  parameters: {
    clientId: '<your-client-id>',
    organizationId: '<your-org-id>',
    shortCode: '<your-short-code>',
    siteId: '<your-site-id>'
  },
};
```

### Redis cache

To use a Redis cache, instantiate a CacheManagerRedis object with a Redis URL and add it to your client config object.

```javascript
import { CacheManagerRedis } from '@commerce-apps/core';

const cacheManager = new CacheManagerRedis({
  connection: 'redis://localhost:6379',
});
const config = {
  cacheManager: cacheManager,
  parameters: {
    clientId: '<your-client-id>',
    organizationId: '<your-org-id>',
    shortCode: '<your-short-code>',
    siteId: '<your-site-id>'
  },
};
```

#### Memory management

Redis can be configured to apply an eviction policy when the specified memory limit is reached. See [this article](https://redis.io/topics/lru-cache/) to set up Redis as an LRU cache and to learn more about supported eviction policies.

## Retry Policies

Use the node-retry package to facilitate request retries. The following retry type definition is taken from the node-retry package.

```typescript
type RetrySettings = {
  /**
   * Whether to retry forever.
   * @default false
   */
  forever?: boolean;
  /**
   * Whether to [unref](https://nodejs.org/api/timers.html#timers_unref) the setTimeout's.
   * @default false
   */
  unref?: boolean;
  /**
   * The maximum time (in milliseconds) that the retried operation is allowed to run.
   * @default Infinity
   */
  maxRetryTime?: number;
  /**
   * The maximum amount of times to retry the operation.
   * @default 10
   */
  retries?: number;
  /**
   * The exponential factor to use.
   * @default 2
   */
  factor?: number;
  /**
   * The number of milliseconds before starting the first retry.
   * @default 1000
   */
  minTimeout?: number;
  /**
   * The maximum number of milliseconds between two retries.
   * @default Infinity
   */
  maxTimeout?: number;
  /**
   * Randomizes the timeouts by multiplying a factor between 1-2.
   * @default false
   */
  randomize?: boolean;
};
```

All options can be set per client or per request.

Example:

```javascript

    productClient = new Product({
      retrySettings: {

        // This means 3 total calls are made
        retries: 2,

        // Max wait between retries
        maxTimeout: 200,

        // Min wait between retries
        minTimeout: 100
      }
    }

```

## Logging

Default log level of the SDK is WARN (warning). SDK uses [loglevel](https://www.npmjs.com/package/loglevel) npm package. All the log levels supported by [loglevel](https://www.npmjs.com/package/loglevel) package are supported in SDK.

To change the loglevel, set the desired level on the SDK logger.

```javascript
import { sdkLogger } from 'commerce-sdk';

sdkLogger.setLevel(sdkLogger.levels.INFO);
```

INFO level logging enables:

- brief request and response logging

DEBUG level logging enables logging of:

- fetch options
- curl command of the request
- response (response body is not included)
- cache operations

**Note:** Debug level logging may expose sensitive data in the logs

## Security
This library doesn't store or refresh authentication tokens. Storing and refreshing authentication tokens is the responsibility of the SDK consumer.

 This library limits its runtime dependencies to reduce the total cost of ownership as much as possible. However, we recommend that you have security stakeholders review all third-party products (3PP) and their dependencies.

For more information about security considerations related to developing headless commerce applications, see 
[Security Considerations for Headless Commerce](https://developer.commercecloud.com/s/article/HeadlessSecurity) on the 
[Commerce Cloud Developer Center](https://developer.commercecloud.com).

If you discover any potential security issues, please report them to security@salesforce.com as soon as possible.


## Additional Documentation

- [Examples](./examples)
- [Changelog](./CHANGELOG.md)


## License Information

The Commerce SDK is licensed under BSD-3-Clause license. See the [license](./LICENSE.txt) for details.

<!-- Markdown link & img dfn's -->
[circleci-image]: https://circleci.com/gh/SalesforceCommerceCloud/commerce-sdk.svg?style=svg&circle-token=c68cee5cb20ee75f00cbda1b0eec5b5484c58b2a
[circleci-url]: https://circleci.com/gh/SalesforceCommerceCloud/commerce-sdk
