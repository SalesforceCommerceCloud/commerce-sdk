# core

Core provides classes and functions to perform HTTP and authentication operations on an instance of Salesforce B2C Commerce APIs. [commerce-sdk](https://github.com/SalesforceCommerceCloud/commerce-sdk/tree/master/packages/generator) uses core to communicate with Salesforce B2C Commerce APIs.

## Setup

Execute the following commands to install dependencies and build core.

    # To setup
    npm install

    # To build
    npm run build

## Sample Code

```typescript
import { StaticClient } from "@commerce-apps/core";
import { Shop } from 'commerce-sdk';

// Instantiate a Shop client object with configuration parameters.
const shopClient = new Shop.Client({
    baseUri: "https://somewhere.com/v1/shop"
});

// Perform get operation on the client created above using get method of StaticClient
const result = await StaticClient.get({
    client: shopClient, 
    path: "/something"
});

console.log(result);
```

## Testing

To run tests, execute
```bash
npm run test
```
To run tests in debug mode, execute
```bash
npm run test:debug
```

## License Information
This package is licensed under BSD-3-Clause license. See the [license](https://github.com/SalesforceCommerceCloud/commerce-sdk/blob/master/packages/core/LICENSE.txt) for details.