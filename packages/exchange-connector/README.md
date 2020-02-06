# `exchange-connector`

The exchange-connector package allows downloading RAML files from anypoint exchange.

## Setup

Execute the following commands to install dependencies and build exchange-connector.

    # To setup
    npm install

    # To build
    npm run build

    # To link (Optional)
    npm link

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

To run tests, execute
```bash
npm run test
```
To print the detailed test results and errors on the console, execute
```bash
npm run test:debug
```

## License Information
This package is licensed under BSD-3-Clause license. See the [license](./LICENSE.txt) for details.