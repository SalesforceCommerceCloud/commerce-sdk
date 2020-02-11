# commerce-sdk
The Commerce SDK allows easy interaction with the B2C Commerce platform APIs on the Node.js runtime.
​
## Prerequisites
Download and install Node.js and npm [here](https://nodejs.org/en/download/).
​
> **Note:** Only Node.js version 10 and 12 are supported. Other versions can cause unexpected results. To use a different version of Node.js for other projects, you can manage multiple versions of Node.js with [nvm](https://github.com/nvm-sh/nvm).
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
 * Sample TypeScript code shows how Commerce SDK can access Salesforce Commerce 
 * APIs.
 */
​
// Import the SDK
import { Product, helpers } from 'commerce-sdk';

helpers.getAuthToken({
    parameters: {
        clientId: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        organizationId: "f_ecom_bblx_stg",
        shortCode: "staging-001",
        siteId: "RefArch"
    },
    body: {
        type: "guest"
    }
}).then(authToken => {

    // Instantiate a Product client object with configuration parameters.
    const productClient = new Product.ShopperProduct.Client({
        parameters: {
            organizationId: "f_ecom_bblx_stg",
            shortCode: "staging-001",
            siteId: "RefArch"
        },
        headers: {
            Authorization: authToken.getBearerHeader()
        }
    });

    // Retrieve a list of currencies allowed by a merchant.
    productClient.getProduct({ parameters: { id: "product-id" }})
        .then(response => {
            // Do something with the response
            return response.allowed_currencies;
        })
        .catch(error => {
            // Do something with the error
            throw new Error(`Error fetching allowed currencies: ${error}`);
        });
});
```

When using an IDE such as VSCode, the autocomplete feature lets you view the available method and class definitions, including parameters.
​
![Autocomplete](./images/Autocomplete.jpg?raw=true "Autocomplete")
​
To view the details of a method or a variable, hover over methods and variables.
​
![Method Details](./images/MethodDetails.jpg?raw=true "Method Details")
​

## Mulesoft Exchange Documentation
> NOTE: For Beta only, link only works on npmjs
(Documentation)[./VERSION.md]

## License Information
The Commerce SDK is licensed under BSD-3-Clause license. See the [license](./LICENSE.txt) for details.
