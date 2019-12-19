# commerce-sdk
The Commerce SDK is built for the Node.js runtime to easily interact with the B2C Commerce platform APIs. You can use JavaScript or TypeScript to build your Node.js applications and use the SDK to interact with the platform’s APIs.

## Prerequisites
**Node.js -** Install Node.js and npm [here](https://www.npmjs.com/get-npm)

> **Note:** We only support Node.js **version 10**. Using a different version of Node.js may lead to unexpected results. If you are currently using a different version of Node.js and would like to continue using it for other projects, you can use [nvm](https://github.com/nvm-sh/nvm) to manage multiple versions of Node.js.

## Installation
Execute the following command to install commerce-sdk.

```
npm install commerce-sdk
```

## Usage
To use an SDK client, an object of that client must be instantiated. The following parameters may be used to configure the client during instantiation. 
> All the following parameters are **optional**.

| Parameter | Description |
| --------- | ----------- |
| baseUri | URL of the service the SDK will interact with. If the baseUri is not provided, the default baseUri for the relevant RAML file is used.  |
| clientId | Id of the client account created with Salesforce Commerce Cloud. |
| clientSecret | Secret associated with the client id provided above. |
| authHost | URL of the authentication provider. |

### Sample code 
```javascript
/**
 * A sample javascript code to show how Commerce SDK can be used to access Salesforce B2C Commerce platform APIs
 */

let express = require('express');

// Import the SDK
const CommerceSdk = require('commerce-sdk');
const Shop = CommerceSdk.Shop;

// Instantiate Shop client object with the configuration details
const shopClient = new Shop({
    baseUri: "https://somewhere.com/v1/shop",
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    authHost: 'https://somwehere.safe.com'
});

// Get a list of currencies allowed by a merchant
shopClient.getSite()
.then(response => response.allowed_currencies)
.then(console.log)
.catch(error => console.log("Error fetching allowed currencies: " + error));
```
## Documentation
TBA

## Contributing
TBA

## License 
The Commerce SDK is licensed under BSD-3-Clause license. See the [license](https://github.com/SalesforceCommerceCloud/commerce-sdk/blob/master/LICENSE.txt) for more details.

## References
TBA