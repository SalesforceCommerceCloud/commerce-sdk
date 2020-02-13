# `exchange-connector`

The exchange-connector package allows downloading RAML files from Anypoint Exchange.

## Setup

Install dependencies and build exchange-connector:

To set up the exchange-connector: `npm install`

To build the exchange-connector: `npm run build`

To link (optional):`npm link`

## Usage

```
import {getBearer, getRamlByTag} form "@commerce-apps/exchange-connector"

// Gets an Access token for talking with Mulesoft
getBearer(username, password): Promise<Token>

// Searches and returns the list of available RestApis
searchExchange(accessToken: string, searchString: string): Promise<RestApi[]>

// Gets raml from exchange, downloads to specified folder (defaults to ./download )
downloadRestApi(restApi: RestApi, destinationFolder: string): Promise<void | Response> 
```

## Testing

To run tests: `npm run test`

To print the detailed test results and errors on the console:
`npm run test:debug`


## License
This package is licensed under BSD-3-Clause license. See the [license](./LICENSE.txt) for details.