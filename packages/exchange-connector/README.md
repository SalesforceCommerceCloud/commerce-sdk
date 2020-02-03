# `exchange-connector`

> TODO: description

## Setup

Execute the following commands to install dependencies and build exchange-connector.

    # To setup
    npm install

    # To build
    npm run build

## Usage

```
import {getBearer, getRamlByTag} form "@commerce-apps/exchange-connector"

// Gets an Access token for talking with Mulesoft
getBearer(username, password): Promise<Token>

// Gets raml from exchange, downloads to specified folder (defaults to ./download )
getRamlByTag(accessToken: string, tag: string, downloadFolder?: string): Promise<void> 

// To link
npm i && npm run build && npm link

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
This package is licensed under BSD-3-Clause license. See the [license](https://github.com/SalesforceCommerceCloud/commerce-sdk/blob/master/packages/exchange-connector/LICENSE.txt) for details.