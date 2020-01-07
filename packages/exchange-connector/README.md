# `exchange-connector`

> TODO: description

## Usage

```
import {getBearer, getRamlByTag} form "@commerce-sdk/exchange-connector"

// Gets an Access token for talking with Mulesoft
getBearer(username, password): Promise<Token>

// Gets raml from exchange, downloads to specified folder (defaults to ./download )
getRamlByTag(accessToken: string, tag: string, downloadFolder?: string): Promise<void> 

// To link
npm i && npm run build && npm link

```

