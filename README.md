# commerce-sdk

The Salesforce Commerce SDK allows easy interaction with the Salesforce B2C Commerce platform APIs on the Node.js runtime.  For a more lightweight SDK, which works in a browser and Node.js for the shopper experience, see [our Isomorphic SDK](https://github.com/SalesforceCommerceCloud/commerce-sdk-isomorphic)

Visit the [Commerce Cloud Developer Center](https://developer.salesforce.com/developer-centers/commerce-cloud) to learn more about Salesforce Commerce. The developer center has API documentation, getting started guides, community forums, and more.
​
## Documentation

An auto-generated [documentation site](https://salesforcecommercecloud.github.io/commerce-sdk/) provides comprehensive reference for all available endpoints and types across API classes. Following the v5.0.0 release, the underlying SDK file structure has been reorganized, introducing additional layers of imports/exports that may affect navigation.

### Navigating the Documentation

**For API Classes:**

1. **Accessing API Classes:** Click on the API class name (e.g., `shopperProducts`) on the right hand side
2. **Viewing Endpoints:** Scroll to the `Classes` section and click the corresponding API class link (e.g., `ShopperProducts`) to see available endpoints and their parameters
3. **Type Definitions:** Scroll to the `Type aliases` section for available types
4. **Navigating Back to API Classes**: To return to the main documentation page with all API classes listed on the right sidebar, click on `Globals` in the navigation.

**Utility Classes:** Utility classes and methods such as `clientConfig` and `helpers` maintain the same structure as previous versions.

**NOTES:** 

1. **Type Access**: API class types are accessible through the `<api_class>Types` namespace (e.g., `ShopperProductsTypes`). Individual types can be accessed as `ShopperProductsTypes.Product`.
2. **Type References**: The `References` section under API classes in the generated documentation may show duplicate entries. This occurs because types are exported both at their original definition and under the API class namespace. Both references point to the same underlying type definition.
3. **V4 Migration Guide**: Starting in v5, API classes will no longer be exported under API family namespaces. See the [Sample Code](#sample-code) section for migration examples.
4. **Supporting Files**: The SDK includes additional supporting modules beyond the `helpers` SLAS functions. The `types` module provides common type definitions shared across API classes, while the `version` module automatically implements user agent headers for all requests. The user agent value follows the format `commerce-sdk@<version>` based on the current SDK version.

## :warning: Planned API Changes :warning:

### Shopper Context

Starting July 31st 2024, all endpoints in the Shopper context API will require the `siteId` parameter for new customers. This field is marked as optional for backward compatibility and will be changed to mandatory tentatively by January 2025. You can read more about the planned change [here](https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-context?meta=Summary) in the notes section.

### Shopper Login (SLAS)

SLAS will soon require new tenants to pass `channel_id` as an argument for retrieving guest access tokens. You can read more about the planned change [here](https://developer.salesforce.com/docs/commerce/commerce-api/guide/slas.html#guest-tokens).

Please be aware that existing tenants are on a temporary allow list and will see no immediate disruption to service.  We do ask that all users seek to adhere to the `channel_id` requirement before the end of August to enhance your security posture before the holiday peak season.

In practice, we recommend that customers using the SLAS helper functions upgrade to `v4.0.0` of the `commerce-sdk`.

## :warning: Planned SDK Changes :warning:

### Encoding path parameters

In the next major version release, the SDK will encode special characters (UTF-8 based on SCAPI guidelines) in path parameters by default. Please see the [Encoding special characters](#encoding-special-characters) section for more details.

## Prerequisites

Download and install Node.js and npm [here](https://nodejs.org/en/download/).
​
> **Note:** Only Node.js versions 16, 18, and 20 are supported. Other versions can cause unexpected results. To use a different version of Node.js for other projects, you can manage multiple versions of Node.js with [nvm](https://github.com/nvm-sh/nvm). ​

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
 * For more information, see [Get started with Salesforce Commerce B2C APIs](https://developer.salesforce.com/docs/commerce/commerce-api/guide/get-started.html).
 */

// Import the SDK in TypeScript
// tsc requires the --esModuleInterop flag for this
// Starting in v5, API classes will no longer be namespaced under API family
import { ShopperSearch, ShopperLogin, helpers, slasHelpers } from "commerce-sdk";
// For v4 and below, you'll have to import the API family first
// import { Search, Customer, helpers, slasHelpers } from "commerce-sdk";
// const loginClient = new Customer.ShopperLogin(config);
// const searchClient = new Search.ShopperSearch(config);

// Older Node.js versions can instead use:
// const { ClientConfig, helpers, slasHelpers Search } = require("commerce-sdk");

// Types for each individual API can be imported as <api_name>Types starting in v5
import type { ShopperLoginTypes } from "commerce-sdk"

// demo client credentials, if you have access to your own please replace them below.
// do not store client secret as plaintext. Store it in a secure location.
const CLIENT_ID = "da422690-7800-41d1-8ee4-3ce983961078";
const CLIENT_SECRET = "D*HHUrgO2%qADp2JTIUi";
const ORG_ID = "f_ecom_zzte_053";
const SHORT_CODE = "kv7kzm78";
const SITE_ID = "RefArch";

// client configuration parameters
const config = {
  headers: {},
  parameters: {
    clientId: CLIENT_ID,
    organizationId: ORG_ID,
    shortCode: SHORT_CODE,
    siteId: SITE_ID,
  },
};

/**
 * Get the shopper or guest JWT/access token, along with a refresh token, using client credentials
 *
 * @returns guest user authorization token
 */
async function getGuestUserAuthToken(): Promise<ShopperLoginTypes.TokenResponse> {
  const base64data = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const headers = { Authorization: `Basic ${base64data}` };
  const loginClient = new ShopperLogin(config);

  return await loginClient.getAccessToken({
    headers,
    body: { grant_type: "client_credentials" },
  });
}

// Alternatively you may use the SLAS helper functions to generate JWT/access token
const guestTokenResponse = await slasHelpers.loginGuestUser(
    new ShopperLogin(config), 
    { redirectURI: 'http://localhost:3000/callback' }
  )
  .then((guestTokenResponse) => {
    console.log("Guest Token Response: ", guestTokenResponse);
    return guestTokenResponse;
  })
  .catch(error => console.log("Error fetching token for guest login: ", error));

// Get a JWT to use with Shopper API clients
getGuestUserAuthToken().then(async (token) => {
  // Add the token to the client configuration
  config.headers["authorization"] = `Bearer ${token.access_token}`;

  const searchClient = new ShopperSearch(config);

  // Search for dresses
  const searchResults = await searchClient.productSearch({
    parameters: { q: "dress", limit: 5 }
  });

  if (searchResults.total) {
    const firstResult = searchResults.hits[0];
    console.log(`${firstResult.productId} ${firstResult.productName}`);
  } else {
    console.log("No results for search");
  }

  return searchResults;
}).catch(async (e) => {
  console.error(e);
  console.error(await e.response.text());
});
```

### SLAS helpers

The SDK includes helper functions to help developers easily onboard SLAS onto their applications to assist with authentication. A brief example is shown in the sample code above. The SLAS helpers offer both public and private client functions, the main difference being the private client functions require a `client_secret`. Code examples on how to use the different functions can be found the in the [examples](https://github.com/SalesforceCommerceCloud/commerce-sdk/tree/main/examples) folder (examples 05 and 06). More information about SLAS and public/private client flows can be found [here](https://developer.salesforce.com/docs/commerce/commerce-api/guide/slas.html).

### Error Handling

SDK methods return an appropriate object by default when the API call returns a successful response. The object is built from the body of the response. If the API response is not successful, an Error is thrown. The error message is set to the status code plus the status text. The Error object includes a custom 'response' attribute with the entire Response object for inspection.

```typescript
  try {
    await productClient.getProduct({
      parameters: {
        id: "non-existant-id"
      }
    });
  } catch (e) {
    console.error(await e.response.text());
  }
```

```json
{
  "title": "Product Not Found",
  "type": "https://api.commercecloud.salesforce.com/documentation/error/v1/errors/product-not-found",
  "detail": "No product with ID 'non-existant-id' for site 'RefArch' could be found.",
  "productId": "non-existant-id",
  "siteId": "RefArch"
}
```

### Autocompletion

When using an IDE such as VSCode, the autocomplete feature lets you view the available method and class definitions, including parameters.
​

![Autocomplete](https://github.com/SalesforceCommerceCloud/commerce-sdk/raw/main/images/Autocomplete.jpg?raw=true 'Autocomplete')

To view the details of a method or a variable, hover over methods and variables.
​

![Method Details](https://github.com/SalesforceCommerceCloud/commerce-sdk/raw/main/images/MethodDetails.jpg?raw=true 'Method Details')

![Parameter Details](https://github.com/SalesforceCommerceCloud/commerce-sdk/raw/main/images/ParameterDetails.jpg?raw=true 'Parameter Details')

Autocomplete also shows the available properties of the data returned by SDK methods.

![Result Autocomplete](https://github.com/SalesforceCommerceCloud/commerce-sdk/raw/main/images/ResultAutocomplete.jpg?raw=true 'Result Autocomplete')

### Fetch Options

Fetch options are able to be passed on to modify the behavior of the fetch call. There are two ways to pass on fetch options:

1. Through the client config

```javascript
const config = {
    parameters: {
        clientId: CLIENT_ID,
        organizationId: ORG_ID,
        shortCode: SHORT_CODE,
        siteId: SITE_ID,
    },
    fetchOptions: {
        redirect: "error",
    }
}
```

2. Through the SDK function call

```javascript
const client = new ShopperLogin(config);

client.authorizeCustomer({
  headers: { ... },
  body: { ... },
  fetchOptions: {
    redirect: "manual"
  }
});
```

If both the client config and the function call define the same fetch option with different values, the fetch option value for the function call will take priority. In the examples above, both pass in the `redirect` fetch option with different values, however, `redirect: "manual"` will take precedence because it was passed on the function call level. 

### Custom Query Parameters

With the introduction of [hooks for Commerce APIs](https://developer.salesforce.com/docs/commerce/commerce-api/guide/extensibility_via_hooks.html), customers can pass custom query parameters through the SDK to be used in their custom hook. Custom query parameters must begin with `c_`:

```javascript
const searchResults = await searchClient.productSearch({
  parameters: { 
    q: "dress", 
    limit: 5,
    c_paramkey: '<param-value>'
  }
});
```

Invalid query parameters that are not a part of the API and do not follow the `c_` custom query parameter convention will be filtered from the request and a warning will be displayed.

### Custom APIs

The SDK supports calling [custom APIs](https://developer.salesforce.com/docs/commerce/commerce-api/guide/custom-apis.html) with a helper function, `customApiHelper.callCustomEndpoint()`.

Example usage:

```javascript
import * as CommerceSdk from "commerce-sdk";
const { helpers } = CommerceSdk;

// client configuration parameters
const clientConfigExample = {
  parameters: {
    clientId: '<your-client-id>',
    organizationId: '<your-org-id>',
    shortCode: '<your-short-code>',
    siteId: '<your-site-id>',
  },
  // If not provided, it'll use the default production URI:
  // 'https://{shortCode}.api.commercecloud.salesforce.com/custom/{apiName}/{apiVersion}'
  // path parameters should be wrapped in curly braces like the default production URI
  baseUri: '<your-base-uri>'
};

const access_token = '<INSERT_ACCESS_TOKEN_HERE>'

// Required params: apiName, endpointPath, shortCode, organizaitonId
// Required path params can be passed into:
// options.customApiPathParameters or clientConfig.parameters
// customApiPathParameters will take priority for duplicate values
const customApiArgs = { 
  apiName: 'loyalty-info',
  apiVersion: 'v1', // defaults to v1 if not provided
  endpointPath: 'customers'
}

const getResponse = await helpers.callCustomEndpoint({ 
  options: {
    // http operation is defaulted to 'GET' if not provided
    method: 'GET',
    parameters: {
      queryParameter: 'queryParameter1',
    },
    headers: {
      // Content-Type is defaulted to application/json if not provided
      'Content-type': 'application/json',
      authorization: `Bearer ${access_token}`
    },
    customApiPathParameters: customApiArgs,
  }, 
  clientConfig: clientConfigExample,
  // Flag to retrieve raw response or data from helper function
  rawResponse: false
})

const postResponse = await customApiHelper.callCustomEndpoint({ 
  options: {
    method: 'POST',
    headers: {
      authorization: `Bearer ${access_token}`
    },
    customApiPathParameters: {
      apiVersion: 'v1',
      endpointPath: 'greeting',
      apiName: 'e2e-tests',
    },
    // When this flag is set to true, the request body will be automatically 
    // formatted in the expected format set by the 'Content-type' headers
    // 'application/json' or 'application/x-www-form-urlencoded'
    enableTransformBody: true,

    // object can be passed since we have enableTransformBody set to true
    body: { data: 'data' }
    // if enableTransformBody is not set to true,
    // we have to ensure the request body is correctly formatted
    // body: JSON.stringify({ data: 'data' })
  }, 
  clientConfig: clientConfigExample, 
  rawResponse: false
})

console.log('get response: ', getResponse)
console.log('post response: ', postResponse)
```

### Encoding special characters

The SDK currently single encodes special characters for query parameters in UTF-8 format based on SCAPI guidelines. However, the SDK does NOT encode path parameters, and will require the developer to encode any path parameters with special characters.

Additionally, SCAPI has special characters that should be double encoded, specifically `%` and `,`:
- `%` should always be double encoded
- `,` should be double encoded when used as part of an ID/parameter string, and single encoded when used to differentiate items in a list 

There is a helper function called `encodeSCAPISpecialCharacters` that can be utilized to single encode the SCAPI special characters and no other special characters.

Here's an example where the `getCategory/getCategories` endpoints are called with a `categoryID` with special characters:
```javascript
import * as CommerceSdk from "commerce-sdk";
const { helpers, Product } = CommerceSdk;

const clientConfig = {
  parameters: {
    clientId: "<your-client-id>",
    organizationId: "<your-org-id>",
    shortCode: "<your-short-code>",
    siteId: "<your-site-id>",
  }
};

const shopperProducts = new Product.ShopperProducts({
  ...clientConfig,
  headers: {authorization: `Bearer <insert_access_token>`}
});

const categoryId = "SpecialCharacter,%$^@&$;()!123Category";
// "SpecialCharacter%2C%25$^@&$;()!123Category"
const scapiSpecialEncodedId = helpers.encodeSCAPISpecialCharacters(categoryId);


// id is a path parameter for API call:
// <base-url>/product/shopper-products/v1/organizations/{organizationId}/categories/{id}
const categoryResult = await shopperProducts.getCategory({
  parameters: {
    // Path parameters are NOT encoded by the SDK, so we have to single encode special characters
    // and the SCAPI special characters will end up double encoded
    id: encodeURIComponent(scapiSpecialEncodedId),
  }
});

console.log("categoryResult: ", categoryResult);

// `ids` are a query parameter and comma delimited to separate category IDs
const categoriesResult = await shopperProducts.getCategories({
  parameters: {
    // No need to use `encodeURIComponent` as query parameters are single encoded by the SDK
    // So the SCAPI special characters will end up double encoded as well
    // Commas that separate items in a list will end up single encoded
    ids: `${scapiSpecialEncodedId},${scapiSpecialEncodedId}`,
  }
});

console.log("categoriesResult: ", categoriesResult);
```

**NOTE: In the next major version release, path parameters will be single encoded by default**

## Caching

The SDK currently supports two types of caches - In-memory and Redis. Both the implementations respect [standard cache headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control). To use another type of cache, write your own implementation of the [CacheManager](https://github.com/SalesforceCommerceCloud/commerce-sdk-core/tree/main/src/base/cacheManager.ts). See the [default cache manager](https://github.com/SalesforceCommerceCloud/commerce-sdk-core/tree/main/src/base/cacheManagerKeyv.ts) to design your implementation.

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
[Security Considerations for Headless Commerce](https://developer.salesforce.com/docs/commerce/commerce-api/guide/security-considerations-for-headless-commerce.html) on the 
[Commerce Cloud Developer Center](https://developer.salesforce.com/developer-centers/commerce-cloud).

If you discover any potential security issues, please report them to security@salesforce.com as soon as possible.


## Additional Documentation

- [Examples](./examples)
- [Changelog](./CHANGELOG.md)


## License Information

The Commerce SDK is licensed under BSD-3-Clause license. See the [license](./LICENSE.txt) for details.
