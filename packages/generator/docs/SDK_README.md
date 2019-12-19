# commerce-sdk
commerce-sdk is a Javascript library which helps you easily interact with the B2C Commerce platform APIs. The SDK is built for the Node.js runtime, one of the most popular development platforms for web developers today. You can use JavaScript or TypeScript to build your Node.js applications and use the SDK to interact with the platform’s APIs.

## Installation

To install commerce-sdk, you must have npm installed on your computer. To check if you already have npm, run:

```
npm -v
```

If you don't have npm installed, install it [here](https://www.npmjs.com/get-npm).

Once npm is installed, run the following command to install commerce-sdk

```
npm install commerce-sdk
```

## Usage
To use an SDK client, an object of that client must be instantiated with the following configuration parameters.
```yaml
baseUri: Url of the service the SDK should interact with
clientId: Id of the client account created with Salesforce Commerce Cloud
clientSecret: Secret associated with the client id provided above
authHost: URL of the authentication provider
headers (Optional): Additional HTTP headers to be associated with the requests
```
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
    baseUri: "https://anypoint.mulesoft.com/api/v1/links/a9f65fa0-7ee2-4ba8-b532-49bfdd1b482c/shop",
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    authHost: 'https://somwehere.safe.com',
    headers: '{ "Cache-control": "no-cache" }'
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
commerce-sdk has been licensed with BSD-3-Clause license. See the [license](https://github.com/SalesforceCommerceCloud/commerce-sdk/blob/master/LICENSE.txt) for more details.

## References
TBA