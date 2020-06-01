# commerce-sdk

The Salesforce Commerce SDK allows easy interaction with the Salesforce B2C Commerce platform APIs on the Node.js runtime.

Visit the [Commerce Cloud Developer Center](https://developer.commercecloud.com/) to learn more about Salesforce Commerce. The developer center has API documentation, getting started guides, community forums, and more.
​
## Prerequisites
Download and install Node.js and npm [here](https://nodejs.org/en/download/).
​
> **Note:** Only Node.js version 10 and 12 LTS are supported. Other versions can cause unexpected results. To use a different version of Node.js for other projects, you can manage multiple versions of Node.js with [nvm](https://github.com/nvm-sh/nvm).
​
## Installation
Use npm to install the Commerce SDK.
​
```
npm install commerce-sdk
```
## Usage
To use an SDK client, instantiate an object of that client and configure these parameters.
> **Note:** These are optional parameters.

| Parameter | Description |
| --------- | :----------- |
| baseUri | URL of the service with which the SDK interacts. If the baseUri isn't provided, the default baseUri for the relevant RAML file is used.  |
| clientId | ID of the client account created with Salesforce Commerce. |
| organizationId | The unique identifier for your Salesforce identity. |
| shortCode | Region specific merchant ID. |
| siteId | A unique site ID (for example, RefArch or SiteGenesis). |



### Sample Code
```javascript
/**
 * Sample TypeScript code that shows how Commerce SDK can access Salesforce Commerce
 * APIs.
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
let config = new ClientConfig();
config = {
    headers: {},
    parameters: {
        clientId: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        organizationId: "f_ecom_bblx_stg",
        shortCode: "0dnz6oep",
        siteId: "RefArch"
    }
}

// Get a JWT to use with Shopper API clients, a guest token in this case
helpers.getShopperToken(config, { type: "guest" }).then(async (token) => {

    try {
        // Add the token to the client configuration
        config.headers.authorization = token.getBearerHeader();

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
        console.error(e);
        console.error(await e.response.text());
    }
}).catch(async (e) => {
    console.error(e);
    console.error(await e.response.text());
});
```

When using an IDE such as VSCode, the autocomplete feature lets you view the available method and class definitions, including parameters.
​

![Autocomplete](https://github.com/SalesforceCommerceCloud/commerce-sdk/raw/master/packages/generator/images/Autocomplete.jpg?raw=true "Autocomplete")

To view the details of a method or a variable, hover over methods and variables.
​

![Method Details](https://github.com/SalesforceCommerceCloud/commerce-sdk/raw/master/packages/generator/images/MethodDetails.jpg?raw=true "Method Details")

![Parameter Details](https://github.com/SalesforceCommerceCloud/commerce-sdk/raw/master/packages/generator/images/ParameterDetails.jpg?raw=true "Parameter Details")

Autocomplete will also show the available properties of the data returned by SDK methods.


![Result Autocomplete](https://github.com/SalesforceCommerceCloud/commerce-sdk/raw/master/packages/generator/images/ResultAutocomplete.jpg?raw=true "Result Autocomplete")

## Caching

The SDK currently supports two types of caches - In-memory and Redis. Both the implementations respect [standard cache headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control). If you would like to use another type of cache, you can write your own implementation of the [CacheManager](../core/src/base/cacheManager.ts)

### In-memory cache
In-memory caching of responses is enabled by default. To disable caching for a client, set cacheManager to 'null'.
```javascript
const config = {
    cacheManager: null,
    parameters: {
        clientId: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        organizationId: "f_ecom_bblx_stg",
        shortCode: "0dnz6oep",
        siteId: "RefArch"
    }
}
```

### Redis cache
To use a Redis cache, instantiate a CacheManagerRedis object with your Redis URL and put it in your client config object.
```javascript
import { CacheManagerRedis } from "@commerce-apps/core"

const cacheManager = new CacheManagerRedis({ connection: "redis://localhost:6379" });
const config = {
    cacheManager: cacheManager,
    parameters: {
        clientId: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        organizationId: "f_ecom_bblx_stg",
        shortCode: "0dnz6oep",
        siteId: "RefArch"
    }
}
```
#### Memory management

When the specified amount of memory is reached, Redis can be configured to apply an eviction policy. Refer to [this article](https://redis.io/topics/lru-cache/) to setup Redis as an LRU cache and to learn more about supported eviction policies. 

## Retry Policies
We are utilizing the node-retry package to facilitate request retries.  The retry type definition looks as follows as taken from the node-retry package.

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
}
```

All of these options can either be set on a per client or per request basis.

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
import { sdkLogger } from "commerce-sdk";

sdkLogger.setLevel(sdkLogger.levels.INFO);
```

INFO level logging will enable brief request and response logging.
DEBUG level logging will enable logging of 
 * fetch options
 * curl command of the request
 * response (response body is not included)
 * cache operations
  
**Note:** Debug level logging may expose sensitive data in the logs 

## Additional Documentation 
[API Documentation](./APICLIENTS.md)  
[Changelog](./CHANGELOG.md)

## License Information
The Commerce SDK is licensed under BSD-3-Clause license. See the [license](./LICENSE.txt) for details.
