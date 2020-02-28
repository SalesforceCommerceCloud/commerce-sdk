# commerce-sdk

The Salesforce Commerce SDK allows easy interaction with the Salesforce B2C Commerce platform APIs on the Node.js runtime.
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
// Import the SDK
import { ClientConfig, helpers, Search } from "commerce-sdk";

// Create a configuration to use when creating API clients
const config:ClientConfig = {
    headers: {
        connection: "close"
    },
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
                q: "dress"
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

<img alt="Autocomplete" src="https://github.com/SalesforceCommerceCloud/commerce-sdk/raw/master/packages/generator/images/Autocomplete.jpg?raw=true" style="width:1368px;" /> 

To view the details of a method or a variable, hover over methods and variables.
​

<img alt="Method Details" src="https://github.com/SalesforceCommerceCloud/commerce-sdk/raw/master/packages/generator/images/MethodDetails.jpg?raw=true" style="width:766px;" /> 

<img alt="Parameter Details" src="https://github.com/SalesforceCommerceCloud/commerce-sdk/raw/master/packages/generator/images/ParameterDetails.jpg?raw=true" style="width:988px" /> 

Autocomplete will also show the available properties of the data returned by SDK methods.


<img alt="Result Autocomplete" src="https://github.com/SalesforceCommerceCloud/commerce-sdk/raw/master/packages/generator/images/ResultAutocomplete.jpg?raw=true" style="width:1256px" /> 

## Additional Documentation 
[API Versions Used](./VERSION.md)
[Changelog](./CHANGELOG.md)

## License Information
The Commerce SDK is licensed under BSD-3-Clause license. See the [license](./LICENSE.txt) for details.