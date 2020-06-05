# Generator

> **Note:** This readme is here to allow a spot for the commerce-sdk readme to be in the root of the package.

* Templates are rendered into the renderDir specified by [build-config.ts](../../../build-config.ts)
* Once rendered they are transpiled to the dist directory just like every other package

## Usage

### Using real endpoints

> By default *ALL* build commands use local files for testing purposes. In order to build the actual SDK you need to run the build with the environmental variable of `EXCHANGE_DOWNLOAD` set to `1`

For example

```bash
  # To build sdk
  EXCHANGE_DOWNLOAD=1 npm run build
```

Additionally you need credentials for exchange to download the APIs.  This can be found in a .env file or in your environmental configuration.

For example

```
ANYPOINT_USERNAME=<username>
ANYPOINT_PASSWORD=<password>
```

### Building the SDK

Simply run `npm run build`

> NOTE: Core must already be built

In the backend this is running a bunch of gulp tasks to accomplish this.

### Build Operation List

> NOTE: Core must already be built

Another option is to build a list of operations. Simply run `npm run renderOperationList` to build a list of operations.

You can then find this list at `renderedTemplates/operationList.yaml`

## Logging

Default log level of the Generator is INFO. Generator uses [loglevel](https://www.npmjs.com/package/loglevel) npm package. So all the log levels supported by [loglevel](https://www.npmjs.com/package/loglevel) package are supported in Generator.

To change the loglevel, set the log level in environment variable

```
SDK_GENERATOR_LOG_LEVEL=debug
```

## Dependencies

Dependencies here are used for 2 different things, generation and the sdk itself.  This is an important distinction devDependencies are not distributed.

* All devDependencies are used for the code generation only
* All dependencies are used for the commerce-sdk itself

## Troubleshoot

### Failure to get asset information and download the RAML

Sometimes getting information about an asset and downloading it may fail. When that happens process will not halt and the rest of the assets will still be downloaded. To successfully generate the SDK, missing pieces will have to be filled in manually. Steps to get the required information are following.

#### To get asset information

1. Get an access token from <https://anypoint.mulesoft.com/accounts/login> with your anypoint username and password. If using curl, use the following command.

  ```
  curl "https://anypoint.mulesoft.com/accounts/login"
  -X POST
  -d '{"username": "<username>", "password": "<password>"}'
  -H "Content-Type: application/json"
  ```

2. Use the access token to get the asset. It is recommended that you use a tool like Postman for making this request because the response will likely be huge. If using curl, the following command may be used.

  ```
  curl "https://anypoint.mulesoft.com/exchange/api/v2/assets/<asset-id>/<version>"
  -H "Authorization: Bearer <access-token>"
  ```

3. Once you have the asset information for the version currently in production, add the missing information for the api in `apis/api-config.json`. Following information will need to be filled.

* id
* updatedDate
* version
* fatRaml.createdDate
* fatRaml.md5
* fatRaml.sha1

4. Once all the information has been added to api-config.json, download the Fat RAML for the api from exchange using the following URL
`https://anypoint.mulesoft.com/exchange/<group-id>/<asset-id>`
5. Now, you should have a zip for the api on your machine. Unzip it, rename it to be the asset-id of the api (e.g. shopper-baskets for Shopper Baskets) and move it to apis directory.
6. Run `npm run build`. It should now successfully generate the SDK.
