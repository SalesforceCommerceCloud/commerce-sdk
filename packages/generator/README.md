# commerce-sdk
The Commerce SDK allows easy interaction with the B2C Commerce platform APIs on the Node.js runtime.

## Prerequisites
**Node.js -** Install Node.js and npm [here](https://nodejs.org/en/download/)

> **Note:** We currently only support Node.js **version 10**. Using a different version of Node.js may lead to unexpected results. If you are currently using a different version of Node.js and would like to continue using it for other projects, you can use [nvm](https://github.com/nvm-sh/nvm) to manage multiple versions of Node.js.

## Installation
Execute the following command to install the Commerce SDK.

```
npm install commerce-sdk
```

## Usage
To use an SDK client, an object of that client must be instantiated. The following parameters may be used to configure the client during instantiation. 
> **Note:** All the following parameters are **optional**.

| Parameter | Description |
| --------- | :----------- |
| baseUri | URL of the service the SDK will interact with. If the baseUri is not provided, the default baseUri for the relevant RAML file is used.  |
| clientId | ID of the client account created with Salesforce Commerce Cloud. |
| clientSecret | Secret associated with the client ID provided above. |

### Sample code 
```javascript
/**
 * A sample TypeScript code to show how Commerce SDK can be used to access 
 * Salesforce B2C Commerce platform APIs
 */

// Import the SDK
import { Shop } from 'commerce-sdk';

// Instantiate Shop client object with the configuration details
const shopClient = new Shop({
    baseUri: "https://somewhere.com/v1/shop",
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret'
});

// Get a list of currencies allowed by a merchant
shopClient.getSite()
    .then(response => {
        // Do something with the response
        return response.allowed_currencies;
    })
    .catch(error => {
        // Do something with the error
        throw new Error(`Error fetching allowed currencies: ${error}`);
    });
```
If you use an IDE, you can use its autocomplete feature to peek at all the available methods and variables defined in that client class.

![Autocomplete](../../images/Autocomplete.jpg?raw=true "Autocomplete")

You can also see the details of a method or a variable by hovering over them.

![Method Details](../../images/MethodDetails.jpg?raw=true "Method Details")

## Documentation
TBA

## Contributing
TBA

## License 
The Commerce SDK is licensed under BSD-3-Clause license. See the [license](https://github.com/SalesforceCommerceCloud/commerce-sdk/blob/master/LICENSE.txt) for more details.

## References
TBA